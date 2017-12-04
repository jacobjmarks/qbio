namespace BloomFilter

open System.IO
open System

module FileIO =
    /// abstract representation of blocks
    type NotatedBlock(s:int, b:int) =
        member this.S = s
        member this.B = b
        member this.GetString = "B" + (string this.S) + "." + (string this.B)

    /// read sequences from a file
    let read_sequences (file_path:string) =
        printfn "\nreading sequences from %s" file_path

        let lines = Seq.toArray (File.ReadLines file_path)

        let read_sequence i =
            let sub_begin = i
            let mutable j = sub_begin
            while j < lines.Length && lines.[j].[0] <> '>' do
                j <- j + 1
            let sub_end = j
            let sequence_lines = Array.sub lines i (j - i)
            System.String.Concat(sequence_lines)

        let mutable sequences = Array.empty

        for i in 0..lines.Length-1 do
            if lines.[i].[0] = '>' then
                sequences <- Array.append sequences [|read_sequence (i+1)|]

        printfn "sequences are of respective sizes: %A" [| for sequence in sequences -> sequence.Length |]
        sequences

    /// write a matrix to a csv file
    let write_matrix (matrix:int[][]) (file_name:string) =
        Console.Write("\nwriting a matrix to {0}... ", file_name)
        let wr = new System.IO.StreamWriter(file_name)
        for i in 0..matrix.Length-1 do
            for j in 0..matrix.[i].Length-1 do
                wr.Write(string matrix.[i].[j] + ",")
            wr.Write(Environment.NewLine)
        wr.Close()
        Console.Write("done")

    /// write query columns
    let write_queries (s:string[][][]) (kmer_matrix:int[][]) (bloom_matrix:int[][]) (file_name:string) =
        Console.Write("\nwriting queries to {0}... ", file_name)
        let num_sequences = s.Length
        let num_blocks_per_sequence = [| for sequence in s -> sequence.Length |]

        let mutable queries = Array.empty
        for s in 1..num_sequences do
            let num_blocks = num_blocks_per_sequence.[s-1]
            for b in 1..num_blocks do
                let notated = new NotatedBlock(s, b)
                queries <- Array.append queries [|notated|]

        //let mutable k_written = Array.empty




        let wr = new System.IO.StreamWriter(file_name)
        let sep = "\t"
        wr.Write("QuerySeq" + sep + "Query" + sep + "Target" + sep + "KBits" + sep + "BFBits")
        for i in 0..(queries.Length-1) do
            for j in i..queries.Length-1 do

                let query = queries.[i]
                let target = queries.[j]
                let query_sequence = query.S

                let kbits = kmer_matrix.[j].[i]
                let bfbits = bloom_matrix.[j].[i]

                //if not (Array.contains kbits k_written) then

                // writing

                let write_val (header:string) (value:string) =
                    let mutable spaces = ""
                    for i in 0..(header.Length - value.Length - 1) do
                        spaces <- spaces + " "
                    wr.Write(spaces)
                    wr.Write(value)
                    wr.Write(sep)

                wr.Write(Environment.NewLine)

                write_val "QuerySeq" ("Seq" + string query_sequence)
                write_val "Query" (query.GetString)
                write_val "Target" (target.GetString)
                write_val "KBits" (string kbits)
                write_val "BFBits" (string bfbits)
                    //k_written <- Array.append k_written [| kbits |]

        wr.Close()

        Console.Write("done")