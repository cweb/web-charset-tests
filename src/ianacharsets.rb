# ianacharsets.rb 
# Last modified: January 7, 2012
#
# Description:
# Fetches the list of character set names and aliases
# from IANA and parses them into JSON format.
#
# Warning:
# No error handling.
#

require 'net/http'

# Globals
name = nil 
label = nil
json = nil
filename = "charsets.json"

# Get the latest list of charsets from IANA
uri = URI('http://www.iana.org/assignments/character-sets')
response = Net::HTTP.get_response(uri)

regexp = /^(Name:|Alias:)[\s]{0,3}([a-zA-Z0-9\-_.+:()]*)\s/m

# Beginning of file
json = "[\r\n"

# Loop through the file and parse it
response.body.each_line do |line|
	result = regexp.match(line)
	if result && result[1] == "Name:"
		# Is this a new name? 
		if name != result[2] && name != nil
			# End previous block
			json.concat("]\r\n},\r\n")
		end
		name = result[2]
		# Add the charset name to its own field plus
		# the list of alias labels
		json.concat("{\r\n\"name\":\"" + name + "\",\r\n" + "\"labels\":[\"" + name + "\"")
	end

	if result && result[1] == "Alias:"
		label = result[2]
		# Continue adding alias labels, ignoring those labeled "None"
		if label != "None"
			json.concat(",\"" + label + "\"")
		end
	end
end

# End of file
json.concat("]\r\n}\r\n]")

# Now write out the file

File.open(filename, "w") do |file|
	file.write(json)
end
