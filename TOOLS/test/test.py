import sys
datafile = sys.argv[1]
results = open("./data/results.txt", "w")
results.write(datafile)
results.write("\nWOW!")