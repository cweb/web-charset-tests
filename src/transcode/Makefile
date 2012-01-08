# Makefile for transcode
CFLAGS = -I/usr/local/include
DBGFLAGS = -DDEBUG_CHARSETS
LDFLAGS = -L/usr/local/lib
LIBS = -licuuc -licuio -lpthread -lstdc++
EXE = transcode
SRC = $(EXE).c
OBJ = $(SRC:.c=.o)
RM = rm
RMFLAGS = -f

#
# Setup the rules
#

.PHONY : clean veryclean

debug: $(SRC) $(OBJ)
	$(CC) -g $(CFLAGS) $(DBGFLAGS) -o $(EXE) $(OBJ) $(LDFLAGS) $(LIBS)

transcode: $(SRC) $(OBJ)
	$(CC) $(CFLAGS) -o $(EXE) $(OBJ) $(LDFLAGS) $(LIBS)

clean:
	@-$(RM) $(RMFLAGS) $(OBJ)

veryclean: clean
	@-$(RM) $(RMFLAGS) $(EXE)
	@-$(RM) $(RMFLAGS) tcs/*
	@-$(RM) $(RMFLAGS) aliases.php 
	@-$(RM) $(RMFLAGS) aliases.js
	@-$(RM) $(RMFLAGS) $(EXE).core

