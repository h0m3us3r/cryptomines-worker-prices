import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'
import { MongoURI } from '../config'

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

type Distribution = [[number, number]]

const mongo = new MongoClient(MongoURI)
const database = mongo.db("cryptomines");
const workerOrders = database.collection<Worker>("workers");

export const getMPDistribution = async () => {
  await mongo.connect()
  const d: any = await (workerOrders.aggregate([
    {
      '$match': {
        'mintedAt': {
          $gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }, {
      '$group': {
        '_id': '$minePower',
        'count': {
          '$sum': 1
        }
      }
    }, {
      '$sort': {
        '_id': 1
      }
    }
  ]).toArray())
  mongo.close()

  const total = d.map((w: any) => w.count).reduce((a: number, b: number) => a + b)

  let distribution: number[] = []

  d.forEach((w: any) => {
    distribution.push(w.count / total)
  })

  return distribution
}

export default async (req: NextApiRequest, resp: NextApiResponse) => {
  resp.status(200).json(await getMPDistribution())
}
