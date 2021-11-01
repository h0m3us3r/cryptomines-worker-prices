import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const nodeURI = 'https://speedy-nodes-nyc.moralis.io/5b013f3614b1041ce85fd545/bsc/mainnet'
const campaigns = ['0xD905797fa8820061a3d7210E2215B809E64A4aaA', '0x60A93CC037Db063aeaA659029040a7cc59Cc0293']

export const getFunding = async () => {
  let ret: Record<string, number> = {}
  for (const campaign of campaigns) {
    await axios.post(nodeURI, { id: 1, jsonrpc: 2.0, method: 'eth_getBalance', params: [campaign, "latest"] }).then(r => {
      ret[campaign] = parseInt(r.data.result) / 1000000000000000000.0
    })
  }
  return ret
}

export default async (req: NextApiRequest, resp: NextApiResponse) => {
  resp.status(200).json(getFunding())
}