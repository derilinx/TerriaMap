import csv
import json

with open('global.json') as f:
    translations = json.load(f)

fields = ['key', 'en', 'my']
with open('global.csv', 'w') as f:
    writer = csv.writer(f)
    for (section_name, section) in translations.items():
        for (key_name, values) in section.items():
            values = [v.replace('[','').replace(']','').replace('*', '') for v in values]
            writer.writerow(("%s.%s" % (section_name, key_name),) + tuple(values))
