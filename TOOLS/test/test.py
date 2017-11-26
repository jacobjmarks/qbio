import sys

def main():
    length = 0
    with open(sys.argv[1]) as datafile:
        for line in datafile:
            length += len(line)

    with open('./data/results.txt', 'w') as results:
        results.write(str(length))
        results.close()

main()
