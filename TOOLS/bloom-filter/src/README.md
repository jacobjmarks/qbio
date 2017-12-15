# bloom-filter

F# bloom filter implementation for fast DNA sequence comparison.

## Build (Windows)

`.\build.cmd`

## Build (Linux)

`.\build.sh` (requires Mono)

## Parameters

| Parameter       | Default Value | Description                              |
| --------------- | ------------- | ---------------------------------------- |
| blocksize       | 50            | The number of kmers per block.   |
| k               | 6             | The size of each kmer. |
| m               | 50000         | The size of the bloom filter in bits.    |
| f               | 5             | The number of hash functions used for each bloom filter (max is 5). |
| comparekmers    | true          | Whether or not the program should compare kmer blocks. |
| runparallel     | true          | Whether or not the program should run in parallel. |

## Execute

Minimum execution requires a sequence file to be specified. This will use the default values for the parameters (see above).

```
fsi executor.fsx --seqfile data/sequences.fna
```

Different values can be specified using the same syntax.

```
fsi executor.fsx --seqfile seqs.fna --runparallel false
```
