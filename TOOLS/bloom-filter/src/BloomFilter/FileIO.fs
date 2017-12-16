namespace BloomFilter

open System.IO
open System
open XPlot.GoogleCharts

module FileIO =

    /// Sequence.Block notation (e.g. B2.1)
    type NotatedBlock(sequence_index, block_index) =
        member this.SequenceIndex = sequence_index
        member this.Blockindex = block_index
        member this.Notation = "B" + (string this.SequenceIndex) + "." + (string this.Blockindex)

    /// Read sequences from a file
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

    /// Write a matrix to a csv file
    let write_matrix (matrix:int[][]) (file_name:string) =
        Console.Write("\nwriting a matrix to {0}... ", file_name)
        let wr = new System.IO.StreamWriter(file_name)
        for i in 0..matrix.Length-1 do
            for j in 0..matrix.[i].Length-1 do
                wr.Write(string matrix.[i].[j] + ",")
            wr.Write(Environment.NewLine)
        wr.Close()
        Console.Write("done")

    /// Write query columns
    let write_queries (s:string[][][]) (kmer_matrix:int[][]) (bloom_matrix:int[][]) (seqfile:string) = 
        let time = DateTime.Now.ToString("yyyy-MM-dd-HH-mm-ss")
        let queries_file = seqfile + "_" + time + "_queries.txt"
        Console.Write("\nwriting queries to {0}... ", queries_file)
        
        let num_sequences = s.Length
        let num_blocks_per_sequence = [| for sequence in s -> sequence.Length |]
        let queries =   [|
                            for sequence_index in 1..num_sequences do
                                for block_index in 1..num_blocks_per_sequence.[sequence_index-1] do
                                    yield new NotatedBlock(sequence_index, block_index)
                        |]

        let rows =  [|   
                        for i in 0..queries.Length-1 do 
                            for j in i..queries.Length-1 do
                                yield queries.[i], queries.[j], kmer_matrix.[j].[i], bloom_matrix.[j].[i]
                    |]

        let sep = "\t"
        let wr = new System.IO.StreamWriter(queries_file)
        wr.Write("QuerySeq" + sep + "Query" + sep + "Target" + sep + "KBits" + sep + "BFBits")

        let write_val (header:string) (value:string) =
            let count = header.Length - value.Length
            if count > 0 then
                wr.Write(String.replicate count " ")
            wr.Write(value)
            wr.Write(sep)

        rows |> Array.iter 
                (
                    fun (query, target, kbits, bfbits) -> 
                        wr.Write(Environment.NewLine)
                        write_val "QuerySeq" ("Seq" + string query.SequenceIndex)
                        write_val "Query" query.Notation 
                        write_val "Target" target.Notation
                        write_val "KBits" (string kbits)
                        write_val "BFBits" (string bfbits)
                )

        wr.Close()
        Console.Write("done")

        // Charting
        let chart_file = seqfile + "_" + time + "_chart.html"
        Console.Write("\nwriting chart to {0}... ", chart_file)
        let wr = new System.IO.StreamWriter(chart_file)
        let chart_data = rows |> Array.map (fun (_, _, kbits, bfbits) -> (kbits, bfbits)) |> Array.distinctBy (fun (kbits, bfbits) -> bfbits)
        
        let options = 
            Options (
                        hAxis = Axis(title = "kmers"),
                        vAxis = Axis(title = "bits")
                    )
                                
        let chart = chart_data |> Chart.Scatter |> Chart.WithOptions options |> Chart.WithLabel "kmers, bits"
        wr.Write(chart.GetHtml())
        wr.Close()
        Console.Write("done")