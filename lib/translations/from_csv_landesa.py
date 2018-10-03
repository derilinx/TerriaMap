import csv
import json
import collections

fields = ['key', 'notes', 'en', 'th', 'km', 'vm', 'my', 'la']

d = collections.defaultdict(list)
translations = collections.defaultdict(lambda: d)

with open('translated.csv', 'r') as f:
    reader = csv.DictReader(f , fieldnames=fields)
    # header
    reader.next()

    for line in reader:
        section, key = line['key'].split('.')
        translations[section][key] = [line['en'], line['my']]

with open('global_landesa.json', 'w') as f:
    json.dump(translations, f, indent=2)
