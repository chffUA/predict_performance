#include <stdio.h>
#include <string.h>

void DSP_q15tofl_c( const short * x, float *r, int nx );

/* ======================================================================== */  
/*  Constant dataset.                                                       */  
/* ======================================================================== */  
#define NX   (20)  
  
  
/* ======================================================================== */  
/*  Initialize arrays with random test data.                                */  
/* ======================================================================== */  
int     test = 0;  
short  x[NX] =   
{  
    -0x6738,  0x64CD, -0x0883, -0x0191, -0x6A07,  0x63B6,  0x04A6, -0x2F44,  
    -0x1E47,  0x2008, -0x1E8D,  0x53E8, -0x0AFE,  0x5524,  0x6B57,  0x20A5,  
    -0x3EA2,  0x4F39, -0x6E51, -0x0014  
};  
  
float  r_c[NX];  

float  r_c_expected[NX] = { -0.806396, 0.787506, -0.066498, -0.012238, -0.828339, 0.778992, 0.036316, -0.369263, -0.236542, 0.250244, -0.238678, 0.655518, -0.085876, 0.665161, 0.838593, 0.255035, -0.489319, 0.618927, -0.861847, -0.000610 };  
  
int main(int argc, char** argv)  
{     

        #pragma monitor start
    	DSP_q15tofl_c(x, r_c, NX);  
        #pragma monitor stop

	if (argc > 42 && ! strcmp(argv[0], ""))	printf("%f", r_c[NX-1]);

	int i;
	for(i=0; i < NX; i++) {
			if(!(fabs(r_c[i] - r_c_expected[i]) < 0.001)) {
					return 1;
			}
	}
	return 10;

}  
