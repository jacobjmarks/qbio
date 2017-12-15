#I "BloomFilter/bin/Release"
#r "BloomFilter.dll"
#r "packages/Argu/lib/net40/Argu.dll"

open System
open Argu
open BloomFilter.FileIO
open BloomFilter.Blocks

type Arguments =
    | SeqFile of seqfile:string
    | BlockSize of blocksize:int
    | K of k:int
    | M of m:int
    | F of f:int
    | CompareKmers of comparekmers:bool
    | RunParallel of runparallel:bool
with
    interface IArgParserTemplate with
        member s.Usage =
            match s with
            | SeqFile _ -> "The sequence file."
            | BlockSize _ -> "The number of kmers per block."
            | K _ -> "The size of each kmer."
            | M _ -> "The size of the bloom filter in bits."
            | F _ -> "The number of hash functions used for each bloom filter (max is 5)."
            | CompareKmers _ -> "Whether or not the program should compare kmer blocks."
            | RunParallel _ -> "Whether or not the program should run in parallel."

let parser = ArgumentParser.Create<Arguments>(programName = "fsi executor.fsx")
let results =
    try
        parser.Parse (Array.tail fsi.CommandLineArgs)
    with
        | :? Argu.ArguParseException -> failwith (parser.PrintUsage())

let seqfile = results.GetResult <@ SeqFile @>
let blocksize = results.GetResult (<@ BlockSize @>, defaultValue = 50)
let k = results.GetResult (<@ K @>, defaultValue = 6)
let m = results.GetResult (<@ M @>, defaultValue = 50000)
let f = results.GetResult (<@ F @>, defaultValue = 5)
let comparekmers = results.GetResult (<@ CompareKmers @>, defaultValue = true)
let runparallel = results.GetResult (<@ RunParallel @>, defaultValue = true)

printfn "seqfile: %A" seqfile
printfn "blocksize: %A" blocksize
printfn "k: %A" k
printfn "m: %A" m
printfn "f: %A" f
printfn "comparekmers: %A" comparekmers
printfn "runparallel: %A" runparallel

// read the sequencess
let sequences = 
    try
        read_sequences seqfile
    with
    | :? System.IO.DirectoryNotFoundException -> failwithf "Could not find directory %A" seqfile
    | :? System.IO.FileNotFoundException -> failwithf "Could not find file %A" seqfile

// convert the sequences into blocks of kmers
let sequences_to_kmer_blocks = sequences_to_kmers k >> kmers_to_blocks blocksize
let sequences_as_kmer_blocks = sequences |> sequences_to_kmer_blocks

// flatten the 3D array of sequences as kmer blocks into a 2D array of just kmer blocks. With this result, we cannot determine which block belongs to which sequence.
let kmer_blocks = sequences_as_kmer_blocks |> Array.concat

// populate a kmer matrix using the 2D array
let kmer_matrix = if comparekmers then create_matrix (Kmer_Blocks kmer_blocks) runparallel else empty_matrix kmer_blocks.Length

// convert the 2D array into bloom filters and populate the bloom matrix
let bloom_blocks = kmer_blocks_to_bloom_blocks m f kmer_blocks
let bloom_matrix = create_matrix (Bloom_Blocks bloom_blocks) runparallel

// write matrices
//write_matrix kmer_matrix (data_dir + "kmer_matrix.csv")
//write_matrix bloom_matrix (data_dir + "bloom_matrix.csv")

write_queries sequences_as_kmer_blocks kmer_matrix bloom_matrix seqfile

Console.WriteLine("\n\nprogram execution complete.\n")