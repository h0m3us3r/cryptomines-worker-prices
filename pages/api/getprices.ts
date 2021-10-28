import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'
import * as d3 from 'd3'


type Order<T> = {
  nftType?: number
  marketID: number
  tokenID: number
  seller: string
  buyer?: string
  price: number
  listedIn?: number
  listedAt?: Date
  unlistedIn: number
  unlistedAt: Date
  isAvailable?: boolean
  nftData: T
}

type Ship = {
  firstOwner?: string
  tokenId: number
  roll: number
  level: number
  mintedIn?: number
  mintedAt?: Date
}

type Worker = Ship & {
  minePower: number
}

type Price = {
  count: number
  min: number
  q25: number
  q50: number
  q75: number
  max: number
  mean: number
  std: number
}

const MongoURI = 'mongodb://cryptomines:cryptomines$@localhost:27017/?authSource=cryptomines'
const mongo = new MongoClient(MongoURI)
const database = mongo.db("cryptomines");
const workerOrders = database.collection<Order<Worker>>("marketplace");

const roundTo = (n: number, to: number) => {
  return Math.round(n * 10 ** to) / (10 ** to)
}

const fillPrice = (arr: number[]) => {
  const digits = 4

  if (arr) {
    arr = arr.sort((a: number, b: number) => a - b)
    const n = arr.length
    const mean = arr.reduce((a, b) => a + b) / n
    const q25 = d3.quantile(arr, 0.25) as number
    const q50 = d3.quantile(arr, 0.5) as number
    const q75 = d3.quantile(arr, 0.75) as number
    const std = Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
    return {
      count: n,
      min: roundTo(arr[0], digits),
      q25: roundTo(q25, digits),
      q50: roundTo(q50, digits),
      q75: roundTo(q75, digits),
      max: roundTo(arr[n - 1], digits),
      mean: roundTo(mean, digits),
      std: roundTo(std, digits)
    }
  } else {
    return {
      count: 0,
      min: NaN,
      q25: NaN,
      q50: NaN,
      q75: NaN,
      max: NaN,
      mean: NaN,
      std: NaN
    }
  }
}

export const getPrices = async () => {
  await mongo.connect()
  const orders: Order<Worker>[] = await (workerOrders.find({ isAvailable: false, nftType: 0, unlistedAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } }, { projection: { _id: 0, price: 1, listedIn: 1, unlistedIn: 1, "nftData.minePower": 1 }, sort: { unlistedAt: -1 } }).toArray())
  mongo.close()

  const onlyPrices: Record<number, number[]> = {}
  orders.filter(order => !order.listedIn || (order.unlistedIn - order.listedIn) > 3).forEach(order => {
    (onlyPrices[order.nftData.minePower] || (onlyPrices[order.nftData.minePower] = [])).push(order.price)
  })

  const prices: Record<number, Price> = {}
  for (let i = 15; i < 256; ++i) {
    prices[i] = fillPrice(onlyPrices[i])
  }

  return prices
}

export default async (req: NextApiRequest, resp: NextApiResponse) => {
  resp.status(200).json(await getPrices())
}
