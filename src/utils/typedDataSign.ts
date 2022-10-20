import { keccakFromHexString, keccak256, bufferToHex, ecsign, privateToAddress, keccakFromString } from 'ethereumjs-util'
import { rawEncode } from 'ethereumjs-abi'

interface Types {
  EIP712Domain: Array<{ name: string, type: PrimaryType | string }>,
  Person: Array<{ name: string, type: PrimaryType | string }>,
  Mail: Array<{ name: string, type: PrimaryType | string }>,
}

type PrimaryType = keyof Types

type Domain = {
  name: string
  version: string
  chainId: number
  verifyingContract: string
} & Record<string, unknown>

type Message = {
  from: { name: string, wallet: string },
  to: { name: string, wallet: string },
  contents: string
} & Record<string, unknown>

interface TypedData {
  types: Types
  primaryType: PrimaryType
  domain: Domain
  message: Message
}

const typedData: TypedData = {
  types: {
    EIP712Domain: [{
      name: 'name',
      type: 'string'
    }, {
      name: 'version',
      type: 'string'
    }, {
      name: 'chainId',
      type: 'uint256'
    }, {
      name: 'verifyingContract',
      type: 'address'
    }, ],
    Person: [{
      name: 'name',
      type: 'string'
    }, {
      name: 'wallet',
      type: 'address'
    }],
    Mail: [{
      name: 'from',
      type: 'Person'
    }, {
      name: 'to',
      type: 'Person'
    }, {
      name: 'contents',
      type: 'string'
    }],
  },
  primaryType: 'Mail',
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
}

const { types, primaryType, message } = typedData

const dependencies = (primaryType: PrimaryType, found: PrimaryType[] = []) => {
  if (found.includes(primaryType) || !types[primaryType]) return found
  found.push(primaryType)
  for (const field of types[primaryType]) {
    dependencies(field.type as PrimaryType, found)?.forEach(dep => {
      if (!found.includes(dep)) {
        found.push(dep)
      }
    })
  }
  return found
}

const encodeType = (primaryType: PrimaryType) => {
  let deps = dependencies(primaryType).filter(t => t !== primaryType)
  deps = [primaryType].concat(deps.sort())

  let result = ''
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type }) => {
      return (type + name)
    }).join(',')})`
  }

  return result
}

const typeHash = (primaryType: PrimaryType) => {
  return keccakFromString(encodeType(primaryType), 256)
}

const encodeData = (primaryType: PrimaryType, data: Record<string, unknown>) => {
  const encTypes = ['bytes32']
  const encValues = [typeHash(primaryType)]
  for (const field of types[primaryType]) {
    const value = data[field.name]
    if (['string', 'bytes'].includes(field.type)) {
      encTypes.push('bytes32')
      encValues.push(keccakFromString(value as string, 256))
    } else if (types[field.type as PrimaryType] !== undefined) {
      encTypes.push('bytes32')
      encValues.push(keccak256(encodeData(field.type as PrimaryType, value as Record<string, unknown>)))
    } else if (field.type.lastIndexOf(']') === field.type.length - 1) {
      throw new Error('TODO: Arrays currently unimplemented in encodeData')
    } else {
      encTypes.push(field.type)
      encValues.push(value as Buffer)
    }
  }
  return rawEncode(encTypes, encValues)
}

const structHash = (primaryType: PrimaryType, data: Record<string, unknown>) => {
  return keccak256(encodeData(primaryType, data))
}

const signHash = () => {
  const prefixHex = Buffer.from('1901', 'hex')
  const domainStructHash = structHash('EIP712Domain', typedData.domain)
  const msgStructHash = structHash(primaryType, message)
  return keccak256(Buffer.concat([prefixHex, domainStructHash, msgStructHash]))
}

const privateKey = keccakFromString('cow', 256)
const address = privateToAddress(privateKey)
const sig = ecsign(signHash(), privateKey)

export {}