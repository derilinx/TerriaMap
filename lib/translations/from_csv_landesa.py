import csv
import json
import collections

fields = ['key', 'notes', 'en', 'th', 'km', 'vm', 'my', 'la']

translations = collections.defaultdict(dict)

with open('translated.csv', 'r') as f:
    reader = csv.DictReader(f , fieldnames=fields)
    # header
    reader.next()

    for line in reader:
        section, key = line['key'].split('.')
        translations[section][key] = [line['en'], line['my']]

with open('global_landesa.json', 'w') as f:
    json.dump(translations, f, indent=2)
