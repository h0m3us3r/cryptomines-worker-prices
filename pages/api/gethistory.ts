import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'
import * as d3 from 'd3'
import { MongoURI } from './config'

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

type History = [[number, number]]

const mongo = new MongoClient(MongoURI)
const database = mongo.db("cryptomines");
const workerOrders = database.collection<Order<Worker>>("marketplace");

export const getHistory = async (mp: number) => {
  await mongo.connect()
  const orders: Order<Worker>[] = await (workerOrders.find({ "nftData.minePower": mp, isAvailable: false, nftType: 0 }, { projection: { _id: 0, price: 1, listedIn: 1, unlistedIn: 1, unlistedAt: 1 }, sort: { unlistedAt: 1 }, limit: 1000 }).toArray())
  mongo.close()

  let history = new Array<[number, number]>();
  orders.filter(order => !order.listedIn || (order.unlistedIn - order.listedIn) > 3).forEach(order => {
    history.push([order.unlistedAt.getTime(), order.price])
  })

  return history
}

export default async (req: NextApiRequest, resp: NextApiResponse) => {
  if (req.query.mp) {
    resp.status(200).json(await getHistory(parseInt(req.query.mp as string)))
  } else {
    resp.status(400).json({ error: { message: 'mp is required' } })
  }
}
