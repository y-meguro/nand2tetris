// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

    // R0: if keyboard is pressed in previous term then 1
    // R1: if keyboard is pressed in current term then 1

    @R0
    M=0 // R0=0

    @8192 // screen size 32*256
    D=A
    @number_of_pixel
    M=D // number_of_pixel=8192

    @SCREEN // 16384
    D=A
    @position
    M=D // position=16384
    @count
    M=0 // i=0
(LOOP_KBD)
    @KBD
    D=M // D=KBD
    @KEY_PRESSED
    D;JNE
(KEY_NOT_PRESSED)
    @R1
    M=0 // R1=0
    @CHECK_STATE_CHANGE
    0;JMP
(KEY_PRESSED)
    @R1
    M=1 // R1=1
(CHECK_STATE_CHANGE) // if R0 != R1 then update screen
    // check state
    @R0
    D=M // D=R0
    @R1
    D=D-M // D=R1-R0
    @LOOP_KBD
    D;JEQ

    // prepare next
    @R1
    D=M // D=R1
    @R0
    M=D // R0=R1

    // set color
    @SET_WHITE
    D;JEQ
(SET_BLACK)
    @color
    M=-1 // color=-1
    @LOOP_FILL
    0;JMP
(SET_WHITE)
    @color
    M=0 // color=0
(LOOP_FILL)
    // check end
    @count
    D=M // D=count
    @number_of_pixel
    D=M-D // D=number_of_pixel-count
    @LOOP_KBD
    0;JLT

    // fill a pixel
    @color
    D=M // D=color
    @position
    A=M
    M=D

    // prepare next loop
    @position
    M=M+1 // position++
    @count
    M=M+1 // i++
    @LOOP_FILL
    0;JMP
