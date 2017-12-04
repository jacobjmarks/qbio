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
    | M of M:int
    | F of F:int
    | CompareKmers of compare_kmers:bool
    | RunParallel of run_parallel:bool
with
    interface IArgParserTemplate with
        member s.Usage =
            match s with
            | SeqFile _ -> "Specify a sequence file."
            | BlockSize _ -> "Specify a block size."
            | K _ -> "Specify a k."
            | M _ -> "Specify an m."
            | F _ -> "Specify an F."
            | CompareKmers _ -> "Specify a compare_kmers bool."
            | RunParallel _ -> "Specify a run_parallel bool."

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
let compare_kmers = results.GetResult (<@ CompareKmers @>, defaultValue = true)
let run_parallel = results.GetResult (<@ RunParallel @>, defaultValue = true)

printfn "seqfile: %A" seqfile
printfn "blocksize: %A" blocksize
printfn "k: %A" k
printfn "m: %A" m
printfn "f: %A" f
printfn "compare_kmers: %A" compare_kmers
printfn "run_parallel: %A" run_parallel

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
let kmer_matrix = if compare_kmers then create_matrix (Kmer_Blocks kmer_blocks) run_parallel else empty_matrix kmer_blocks.Length

// convert the 2D array into bloom filters and populate the bloom matrix
let bloom_blocks = kmer_blocks_to_bloom_blocks m f kmer_blocks
let bloom_matrix = create_matrix (Bloom_Blocks bloom_blocks) run_parallel

// write matrices
//write_matrix kmer_matrix (data_dir + "kmer_matrix.csv")
//write_matrix bloom_matrix (data_dir + "bloom_matrix.csv")

let time = DateTime.Now.ToString("yyyy-MM-dd-HH-mm-ss")
write_queries sequences_as_kmer_blocks kmer_matrix bloom_matrix (seqfile + "_queries_" + time + ".txt")

Console.WriteLine("\n\nprogram execution complete.\n")