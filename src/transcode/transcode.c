// 
//
// Charset Transcoder and File Generator
// Last modified: January 8, 2012
// 
// Requirements:
// 1. ICU 4.2 (International Components for Unicode)
// 2. You must create the folder to store the output files
//
// See example of ICU Converters from
// http://source.icu-project.org/repos/icu/icu/trunk/source/samples/ucnv/convsamp.cpp
// http://userguide.icu-project.org/conversion/converters
//
// Warning:
// Almost no error handling - create the output directory first!
//
// Description:
// Using ICU's Converter API, this program will transcode a 
// source string (the test case) from ASCII to a target 
// encoding.  Actually, it will transcode from ASCII to all
// 1000+ available encodings in ICU.  A plain text file is
// generated for each encoding, with the test case string 
// as its contents.  An optional parameter can be used
// to limit out to onlone the non-ASCII compatible encodings.
// e.g. EBCDIC is not ASCII compatible - see [1] and [2]
// below.
//
// To assist Web browser character set testing, it also creates two 
// accompanying files, each containing an array of all the alias names 
// from ICU:
//
//   - aliases.php
//   - aliases.js
//
// These files are used by an index.html page
// which loads XmlHttpRequest to call a PHP page, sending
// the alias name as a parameter.  The PHP page returns the
// corresponding plain text file, and sets the Content-Type
// header to match the charset alias.  The response is
// eval() to determine if the encoded string was recognized,
// indicating a supported charset. 
//
// Each test must be executed using a separate HTTP request,
// since you cannot embed multiple character encodings 
// 'locally' in a single HTML page. See:
//
// http://www.w3.org/TR/html4/charset.html
// 
// [1] ascii-safe
// An ASCII-compatible character encoding is a single-byte or variable-length
// encoding in which the bytes 0x09, 0x0A, 0x0C, 0x0D, 0x20 - 0x22, 0x26, 0x27,
// 0x2C - 0x3F, 0x41 - 0x5A, and 0x61 - 0x7A, ignoring bytes that are the second
// and later bytes of multibyte sequences, all correspond to single-byte sequences
// that map to the same Unicode characters as those bytes in
// ANSI_X3.4-1968 (US-ASCII). [RFC1345]
//
// [2] ascii-unsafe
// ASCII-compatible bytes do not map.
//
//

// C headers
#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <stdlib.h>
#include <errno.h>
#include <assert.h>

// OS headers
#include <unistd.h>

// ICU headers
#include <unicode/ucnv.h>     // C Converter API
#include <unicode/ustring.h>  // some more string functions
#include <unicode/ustdio.h>   // for the UFILE stuff
#include <unicode/uchar.h>

#define LENGTHOF(array) (sizeof(array)/sizeof((array)[0]))
#define ALPHA_UCASE "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

#ifndef DEBUG_CHARSETS
#define DEBUG_CHARSETS 0
#endif

#if (DEBUG_CHARSETS)
#define DBG(_x) ((void)fprintf(stderr, "%s %d: ", __FILE__, __LINE__), (void)(_x))
#define DBGN(_x) ((void)(_x))
#else
#define DBG(_x) ((void)0)
#define DBGN(_x) ((void)0)
#endif

//++++++++++++++++++++++++++++++++++++++++++++++++++++++//
// 
// Modify these parameters as desired.
//
// 1) TC = the test case string that will be transcoded
// 2) TC_DIR = the output director where all plain text
//      test cases will be saved.  The are saved using
//      their charset value as the filename, with no
//      extension.
//
//++++++++++++++++++++++++++++++++++++++++++++++++++++++//
#define TC " $%'()*+,-./<>:;="
#define TC_SIZE sizeof(TC) 
#define TC_DIR "tcs//" // *WARNING* This folder must exist!

//
// StringToLower()
//
int StringToLower(const char *source, char **destination)
{
	size_t i;
	assert(source);
	assert(destination);
	if (!source || !destination) {
		errno = EINVAL;
		return -1;
	}

	if (!*source) {
		return 0;
	}

	*destination = NULL;

	size_t length = strlen(source);
	size_t span = strcspn(source, ALPHA_UCASE);
	if (span != length) {
		// source contains upper case characters
		char *p = (char *)malloc(sizeof(char)*(length+1));
		if (p) {
			(void)memcpy(p, source, span);			
			for (i = span; i < length; i++) {
				p[i] = isupper(source[i]) ? tolower(source[i]) : source[i];
			}
			p[length] = '\0';
			*destination = p;
			return 1;
		} else {
			return -1;
		}
	} else {
		// source does not contain upper case characters
		return 0;
	}
	/*NOTREACHED*/
}



//
// ConvertString()
// 
// Converts an input string to an output string using the specified
// character encoding alias.
//
//
int ConvertString(const char *alias, const UChar *input, char *output)
{
	UErrorCode err = U_ZERO_ERROR;
	UConverter *conv = NULL;
	conv = ucnv_open(alias, &err);
	int32_t len = 0;

	len = ucnv_fromUChars(conv, output, BUFSIZ, input, u_strlen(input), &err);
	DBG(fprintf(stderr,"[+] Conversion to alias %s succeeded.\n", alias));

	// Close the UConverter
	ucnv_close(conv);
	if (U_FAILURE(err)) {
		DBG(fprintf(stderr,"[!] ERROR in data conversion: %s\n", u_errorName(err)));
		return -1;
	} else {
		return 0;
	}

	return -1;
}

int WriteFile(char *filename, const char *alias, const UChar *tc, char *output)
{
	// Prepend the file/folder name, and lowercase the alias
	char * temp;
	int i;

	i = StringToLower(alias, &temp);
	// printf("alias=%s, temp=%s\n",alias,temp);
	if (temp != NULL) {
	    strcat(filename, temp);
	}
	else {
		strcat(filename, alias);
	}

	// The UFILE open and write will automatically convert
	// data to the chosen charset.

	UFILE* hFile = u_fopen((const char *)filename, "w", NULL, alias);
	//u_file_write((const UChar *)output, u_strlen(tc), file);
	//u_file_write((const UChar *)output, u_strlen((const UChar *)output), file);
	//u_file_write(output, u_strlen(tc), file);
	// u_file_write converts the input string to the target file's encoding
	u_file_write(tc, u_strlen(tc), hFile);
	//u_fprintf(file, "%s", output);
	u_fclose(hFile);


//	FILE * hFileOut;
//	hFileOut = fopen(filename, "w");
//	fprintf(hFileOut, output);
//	fclose(hFileOut);
	return 0;
}

// 
// GenerateTestCase
//
// Take the charset converter and alias name, and write out
// the test case to an HTML or PHP file.
//
int GenerateTestCase(const char *alias, int sflag)
{
	char output[BUFSIZ] = { 0 };   // the converted string
	char filename[BUFSIZ] = { 0 }; // the charset alias plus a file extension
	// Declare and initialize a UChar array from a string.
	
	// This list of chars was trimmed down to include characters represented
	// in all of the non-ASCII-compatible encodings.  I had to remove
	// #,!,?,a-7,0-9
	U_STRING_DECL(tc1, TC, TC_SIZE);
	U_STRING_INIT(tc1, TC, TC_SIZE);

	// Need to add more test cases
	// Error if alias null
	if (alias == NULL) {
		return -1;
	}

	// A string
	// UChar tc1[] = {  0x003C, 0x0000 }; 
	// Convert the test case to the target encoding
	// NOTE Only necessary when not using the UFILE type which
	// performs a conversion inherently, or, as a preliminary check
	// when using the IsAsciiSafe method.
	
	ConvertString(alias, tc1, output);

	// Check if the converted string is ASCII compatible
	if (sflag) {
		if (!IsAsciiSafe(output, TC)) {
			strcpy(filename, TC_DIR);
			WriteFile(filename, alias, tc1, output);
		}
		else {
			return -1;
		}
	} else {
		strcpy(filename, TC_DIR);
		WriteFile(filename, alias, tc1, output);	
	}

	return 0;
}

// Check the second byte of the string to see if it matches
// an expected second byte of the same string encoded in ASCII.
// For example since < is 0x3C in ASCII, but 0x4C in EBCDIC, 
// then an EBCDIC string would return false because it's not
// ASCII compatible.
// We check the second byte becase the first byte will match in
// some ASCII-incompatible charsets (e.g. UTF-16).
//
// Note this could have false positives as some values may match
// while others don't.  TODO: what TODO?
int IsAsciiSafe(char *string, char *byte)
{
	if (string[1] == byte[1]) {
		return TRUE;
	} else {
		return FALSE;
	}
}

// Walk through the available converters
void WalkAvailableConverters(int sflag)
{
	FILE * hFilePhp;
	hFilePhp = fopen("aliases.php", "w");

	FILE * hFileJs;
	hFileJs = fopen("aliases.js", "w");

	fprintf(hFilePhp, "<?php\n$aliases = array(\n");
	fprintf(hFileJs, "var aliases = [\n");

	UErrorCode status=U_ZERO_ERROR;
    UConverter *conv=NULL;
    int32_t i = 0;
	const char * name;
	const char * alias;

	// A count of aliases per name
	uint16_t count;

	DBG(fprintf(stderr, "[*] ucnv_countAvailable() = %d\n", (int)ucnv_countAvailable()));

    for (i = 0; i < ucnv_countAvailable(); i++) {
        status = U_ZERO_ERROR;
        conv = ucnv_open(ucnv_getAvailableName(i), &status);
        if (U_FAILURE(status)) {
            DBG(fprintf(stderr, "[!] ERROR: converter creation failed for \n converter=%s. Error=%d\n", ucnv_getAvailableName(i), status));
            continue;
        }
		name = ucnv_getAvailableName(i);
		DBG(fprintf(stderr, "[*] Converter: %s contains aliases:\n", name));

		const char **aliases;
		count = ucnv_countAliases(name, &status);
		DBG(fprintf(stderr, "[*] ucnv_countAliases = %d\n", (int)count));

		aliases = (const char **)malloc(count * sizeof(const char *));

		// If aliases were returned
		if (aliases != 0) {
			ucnv_getAliases(name, aliases, &status);

			if (U_FAILURE(status)) {
				DBG(fprintf(stderr, "[!] ERROR: ucnv_getAliases failed for %s.\n ", name));
			} else {
				// If all went well, loop through each alias and do something
				uint16_t aliasN;
				for (aliasN = 0; aliasN < count; ++aliasN) {
					alias = ucnv_getAlias(name, aliasN, &status);
					if (U_FAILURE(status)) {
						DBG(fprintf(stderr, "[!] ERROR: ucnv_getAlias(%s) failed.\n", name));
					} else if(strlen(alias) > 20) {
						DBG(fprintf(stderr, "[!] ERROR: ucnv_getAlias(%s) alias %s is insanely long, corrupt?\n", name, alias));
					} else {
						// Here's where the goods happen, have a test case created
						// using the current charset alias.
						printf("[*] Creating %s\n", alias);
						if (GenerateTestCase(alias, sflag) == 0) {
							fprintf(hFilePhp, "'%s',\n", alias);
							fprintf(hFileJs, "'%s',\n", alias);
						}
					}
				}
			}
		}

        ucnv_close(conv);
		free((char **) aliases);
    }
    
	fprintf(hFilePhp, ");\n?>");
	fprintf(hFileJs,"];");
	fclose(hFilePhp);
	fclose(hFileJs);
}

void usage(const char *name) {
	if (name && *name) {
		(void)fprintf(stderr, "%s - generate charset encoding test cases.\n", name);
		(void)fprintf(stderr, "Usage: %s [-a]\n", name);
		(void)fprintf(stderr, "       -a will create test cases for all ICU supported encodings\n");
		(void)fprintf(stderr, "       which are not ASCII-compatible.  Otherwise tests will \n");
		(void)fprintf(stderr, "       be generated for all encodings. e.g. EBCDIC is not ASCII-compatible\n");
	}
	exit(EXIT_FAILURE);
}

int main(int ac, char **av)
{
	// Parse command line arguments
	int sflag = 0;
	int ch;
	while ((ch = getopt(ac, av, "a")) != -1) {
		switch (ch) {
			case 'a':
				sflag = 1;
				break;
			case '?':
				// fall through
			default:
				usage(*av);
		}
		if (ch == -1) {
			break;
		}
	}
	ac -= optind;
	av += optind;

    // Get all available converter charset aliases and build tests
	WalkAvailableConverters(sflag);

    exit(EXIT_SUCCESS);
}
