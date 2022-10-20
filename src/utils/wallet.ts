import { generateMnemonic } from 'bip39'
import { Wallet, wordlists, utils } from 'ethers'
import { mnemonicToSeed as _mnemonicToSeed, HDNode, entropyToMnemonic } from '@ethersproject/hdnode'

enum DerivePaths {
  eth = "m/44'/60'/0'/0/0"
}

/**
 * generate new mnemonic
 * @param length 
 * @returns 
 */
export const newMnemonic = (length: number) => {
  return generateMnemonic(length * 32 / 3) // 128 <= entropy <= 256
}

/**
 * seed to mnemonic
 * @param seed 
 * @returns 
 */
export const seedToMnemonic = (seed: string) => {
  try {
    return entropyToMnemonic(seed)
  } catch (err) {
    return null
  }
}

/**
 * generate private seed from mnemonic and salt
 * @param mnemonic
 * @param password salt =>（'mnemonic' + password）
 * @returns 
 */
export const mnemonicToSeed = (mnemonic: string, password?: string) => {
  return _mnemonicToSeed(mnemonic, password)
}

/**
 * generate wallet to mnemonic
 */
export const mnemonicToWallet = (mnemonic: string, options: { salt?: string, coinType?: keyof typeof DerivePaths } = {}) => {
  const hdWallet = HDNode.fromMnemonic(mnemonic, options.salt, wordlists['en']).derivePath(DerivePaths[options.coinType || 'eth'])
  return new Wallet(hdWallet.privateKey)
}

/**
 * generate wallet from mnemonic and salt
 * */
export const generateWallet = (mnemonic: string, salt?: string) => {
  return mnemonicToWallet(mnemonic, { salt })
}

export const generateMainWallet = (mnemonic: string) => {
  if (!mnemonic) return null
  return mnemonicToWallet(mnemonic, { salt: '' })
}

export const generateDIDWalletSalt = (host: string) => {
  const random = utils.hexlify(utils.randomBytes(8))
  const salt = utils.sha256(Buffer.from(`${host}-${random}`, 'utf-8'))
  // const mnemonic = newMnemonic(12)
  // const wallet = mnemonicToWallet(mnemonic, { salt })
  // console.log('--- wallet', wallet, 'main:', mnemonicToWallet(mnemonic, { salt: '' }))
  console.log('--- salt', salt)
  console.log('--- random', random)
  // console.log('--- mnemonic', mnemonic)
  return salt
}

export const createDIDWallet = (mnemonic: string) => {
  return (salt: string) => {
    if (!mnemonic) return null
    return mnemonicToWallet(mnemonic, { salt })
  }
}

export const isValidMnemonic = (mnemonic: string) => utils.isValidMnemonic(mnemonic)

export type HDWallet = Wallet