# bloom-filter

F# bloom filter implementation for fast DNA sequence comparison.

## Building (Windows)

`.\build.cmd`

## Building (Linux)

`.\build.sh` (requires Mono)

## Executing

Minimum execution requires a sequence file to be specified.

```
fsi executor.fsx --seqfile data/sequences.fna
```

This will use the default values for the parameters (see below table).

| Parameter       | Default Value | Description                              |
| --------------- | ------------- | ---------------------------------------- |
| block_size      | 50            | The number of kmers within each block.   |
| k               | 6             | The size of the kmers contained within each block. |
| M               | 50000         | The size of the bloom filter in bits.    |
| F               | 5             | The number of hash functions used for the bloom filter. Max is 5. |
| comparekmers   | true          | A boolean flag which tells the program to compare kmer blocks. |
| runparallel | true          | A boolean flag which tells the program to run in parallel. |

Different values can be specified via the below format.

```
fsi executor.fsx --seqfile seqs.fna --runparallel false
```