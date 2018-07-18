import os, csv

class Csv_FileHelper ( object ) :
    @classmethod
    def Read ( cls, fn ) :
        data = []
        with open(fn, "rb") as file :
            for r in csv.DictReader(filter(lambda row: row[0] != '#', file)) :
                data.append(r)
        return data
    @classmethod
    def Write ( cls, fn, header, data ) :
        with open(fn, "wb") as file :
            writer = csv.DictWriter(file, fieldnames = header, extrasaction = "ignore")
            writer.writeheader()
            for r in data :
                writer.writerow(r)