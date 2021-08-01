# Python 3 script to fetch EDAM and transform it into JSON structure required by the extension
# To make a build with the specific version use _VERSION_ variable

import csv
import json
from urllib.request import urlopen

_VERSION_ = '1.25'
url = 'http://edamontology.org/EDAM_{}.tsv'.format(_VERSION_)

file = urlopen(url)

with open('edam.tsv','wb') as output:
    output.write(file.read())

with open('edam.tsv','r') as tsv:
    tsv = csv.reader(tsv, delimiter='\t')
    edam_data = {}
    for row in tsv:
        edam_data[row[0]] = {
            'label': row[1],
            'synonyms': row[2].split('|'),
            'definition': row[54],
            'comments': row[3].split('|'),
        }
        edam_data['_version'] = _VERSION_

with open('edam_data.js', 'w') as outfile:
    outfile.write('const edam_data = ')
    json.dump(edam_data, outfile)