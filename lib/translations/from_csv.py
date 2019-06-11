import csv
import json
import collections

fields = ['notes', 'key', 'en', 'th', 'km', 'vm', 'my', 'la']

translations = collections.defaultdict(dict)

with open('translated-complete.csv', 'r') as f:
    reader = csv.DictReader(f , fieldnames=fields)
    # header
    reader.next()

    for line in reader:
        try:
            section, key = line['key'].split('.')
            print line['key']
            print section, key
            translations[section][key] = [line['en'], line['th'], line['km'], line['vm'], line['my'], line['la']]
        except Exception as msg:
            #print msg
            #print line['key']
            continue

with open('global.json', 'w') as f:
    json.dump(translations, f, indent=2)
