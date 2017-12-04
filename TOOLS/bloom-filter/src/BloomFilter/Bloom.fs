namespace BloomFilter

open System.Security.Cryptography
open System.Text
open System.Collections

module Bloom = 

    /// get the number of bits set in a BitArray
    let cardinality (b:BitArray) =
        let ints:int array = Array.zeroCreate ((b.Count >>> 5) + 1)
        b.CopyTo(ints, 0)
        let mutable count = 0
        for i in 0..ints.Length-1 do
            let mutable c = ints.[i]
            c <- c - ((c >>> 1) &&& 0x55555555)
            c <- (c &&& 0x33333333) + ((c >>> 2) &&& 0x33333333)
            c <- ((c + (c >>> 4) &&& 0xF0F0F0F) * 0x1010101) >>> 24;
            count <- count + c
        count

    /// generate a bloom filter of size M with F hash functions applied to each of the given elements
    let bloom_filter (elements:string[]) (M:int) (F:int) =
        let bloom = BitArray(M)
        let hash_functions = [| "MD5"; "SHA1"; "SHA256"; "SHA384"; "SHA512" |]

        // apply F hash functions to the given element, setting F bits in the bloom filter
        let hash (element:string) = 
            // select a position in the bloom filter based on a hash code
            let pos_from_code (hash_code:byte[]) = 
                let large_num = Array.fold (fun (acc:int) (x:byte) -> acc + ((int x) + 1 * acc)) 1 hash_code
                let abs_num = abs large_num
                let pos = abs_num % M
                pos

            // apply a hash function to the element, setting a bit in the bloom filter
            let hash_function (algorithm:string) =
                let hash_code = System.Text.Encoding.ASCII.GetBytes(element) |> HashAlgorithm.Create(algorithm).ComputeHash
                let pos = pos_from_code hash_code
                bloom.Set(pos, true)

            // apply F hash functions to the element
            for f in 0..F-1 do
                hash_function hash_functions.[f]

        // add each element to the bloom
        elements |> Array.iter (fun element -> hash element)
        bloom

    /// return the number of pairwise common bits
    let hamming_similarity (b1:BitArray) (b2:BitArray) =
        let b3 = BitArray(b1)
        b3.And(b2) |> ignore
        cardinality b3