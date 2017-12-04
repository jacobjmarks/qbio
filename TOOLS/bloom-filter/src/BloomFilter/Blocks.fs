namespace BloomFilter

open System.Collections
open System
open BloomFilter.Bloom
open System.Threading.Tasks

module Blocks =
    /// get the number of kmers in a string
    let kmers (sequence:string) (k:int) =
        let num_kmers = sequence.Length - k + 1
        [| for position in 0..num_kmers-1 -> sequence.[position..position+k-1] |]

    /// count the number of similar kmers in two arrays of kmers
    let count_of_same_kmers (kmers1:string[]) (kmers2:string[]) =
        let imperative = 
            let mutable count = 0
            for kmer in kmers1 do
                if Array.contains kmer kmers2 then count <- count + 1
            count
        imperative

    /// create a block of kmers from a start position and a size
    let block (kmers:string[]) start_pos size =
        kmers.[start_pos..(start_pos+size-1)]

    /// create an array of kmer blocks from an array of kmers
    let blocks (kmers:string[]) block_size = 
        let num_blocks = kmers.Length / block_size
        [| for b in 0..num_blocks-1 -> block kmers (b * block_size) block_size |]

    /// convert an array of sequences into an array of sequences as kmers
    let sequences_to_kmers (k:int)  (sequences:string[]) =
        Console.Write("\nconverting sequences into kmers... ")
        let result = sequences |> Array.map (fun sequence -> kmers sequence k) 
        Console.Write("done")
        result

    /// convert an |array of sequences as kmers| into an |array of sequences as kmer blocks|
    let kmers_to_blocks (block_size:int) (kmers:string[][]) =
        Console.Write("\nconverting kmers into blocks... ")
        let result = kmers |> Array.map (fun kmers -> blocks kmers block_size)
        Console.Write("done")
        result

    /// convert a |flattened array of sequences as kmer blocks| into a |flattened array of sequences as bloom filter blocks|
    let kmer_blocks_to_bloom_blocks (M:int) (F:int) (kmer_blocks:string[][]) =
        Console.Write("\nconverting kmer blocks into bloom filters in parallel... ")
        let result = kmer_blocks |> Array.Parallel.map (fun kmer_block -> bloom_filter kmer_block M F)
        Console.Write("done")
        result

    /// a discriminated union for representing the two types of block arrays
    type Blocks = Kmer_Blocks of string[][] | Bloom_Blocks of BitArray[]

    /// get the number of blocks in a block array
    let block_length = function
        | Kmer_Blocks x -> x.Length
        | Bloom_Blocks x -> x.Length

    /// compare two blocks within an array of blocks
    let block_comp i j = function
        |Kmer_Blocks x -> count_of_same_kmers x.[i] x.[j]
        |Bloom_Blocks x -> hamming_similarity x.[i] x.[j]

    /// generate an empty square matrix (an array of arrays where each array is one longer than the last) of size |length|
    let empty_matrix length =
        Console.Write("\ngenerating an empty matrix... ")
        let matrix = [| for i in 0..length-1 -> [|for j in 0..i -> -1|] |]
        Console.Write("done")
        matrix

    /// create a similarity matrix (an array of arrays where each array is one longer than the last in order to ignore redunant cells) based on a given array of blocks 
    let create_matrix (blocks:Blocks) (run_in_parallel:bool) =
        let matrix_type =
            match blocks with
            |Kmer_Blocks x -> "kmer"
            |Bloom_Blocks x -> "bloom"

        let length = block_length blocks
        let count_total = (length * length - length) / 2 + length
        let matrix_size = (count_total * 4 |> double) / (1000000 |> double)

        printfn "\n\n\nbased on %A %s blocks I will now populate a matrix of %A cells (over %A MB)..." length matrix_type count_total matrix_size

        let matrix = empty_matrix length
        
        let mutable count_done = 0
        let mutable percentage_complete = 0

        let populate_row i =
            for j in 0..matrix.[i].Length-1 do
                let count = block_comp i j blocks
                matrix.[i].[j] <- count
                count_done <- count_done + 1
                let count_remaining = count_total - count_done
                let new_percent = ((count_done |> double) / (count_total |> double) * 100.0) |> int
                if new_percent <> percentage_complete then
                    percentage_complete <- new_percent
                    lock Console.Out (fun () -> Console.Write("\r{0} {1} block comparisons remaining ({2}% complete)...", count_remaining, matrix_type, percentage_complete))
            
        Console.Write("\npopulating rows...")

        if run_in_parallel then
            Console.WriteLine("\nwarning! running in parallel!")
            Parallel.For(0, matrix.Length, (fun i -> populate_row i)) |> ignore
        else
            for i in 0..matrix.Length-1 do populate_row i

        Console.WriteLine("\r0 {0} block comparisons remaining (100% complete)... done\n", matrix_type)

        matrix