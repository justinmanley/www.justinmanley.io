#!/bin/bash

# make sure that feed content has been generated and that feed files are nonempty
for file in src/content/feeds/*
do
	if ! [ isEmpty=$(test -s $file) ]
	then
		exit $isEmpty
	fi
done
echo "Feeds generated successfully."

# validate html
grunt test