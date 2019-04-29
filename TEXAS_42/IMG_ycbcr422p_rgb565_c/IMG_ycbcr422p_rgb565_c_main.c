#include <stdio.h>
#include <string.h>

void IMG_ycbcr422p_rgb565_c
(
    const short              coeff[5],    
    const unsigned char     *y_data,     
    const unsigned char     *cb_data,    
    const unsigned char     *cr_data,    
    unsigned short 			*rgb_data,   
    unsigned                 num_pixels   
);

/* ======================================================================== */  
/*  IMGLIB function-specific alignments. Refer to the                       */  
/*  TMS320C64x IMG Library Programmer's Reference for details.              */  
/* ======================================================================== */  
#pragma DATA_ALIGN(coef, 8);  
#pragma DATA_ALIGN(y, 8);  
#pragma DATA_ALIGN(cb, 4);  
#pragma DATA_ALIGN(cr, 4);  
#pragma DATA_ALIGN(rgb_c, 8);  
  
/* ======================================================================== */  
/*  Constant dataset.                                                       */  
/* ======================================================================== */  
#define N    (64)

        /* ======================================================================== */
        /*  Initialize arrays with random test data.                                */
        /* ======================================================================== */
        const short  coef[5] =
        {
    0x2543, 0x3313, -0x0C8A, -0x1A04, 0x408D
        };

        unsigned char  y[N] =
        {
     0x05,  0x3A,  0x83,  0xF2,  0x8F,  0xAD,  0x7C,  0xAB,
     0x91,  0x95,  0x91,  0xDB,  0xA2,  0x68,  0x3D,  0x5A,
     0x09,  0x2C,  0x8C,  0xED,  0x68,  0x50,  0x68,  0x52,
     0x32,  0x72,  0xA1,  0x4D,  0x5A,  0x61,  0xE8,  0x1B,
     0x69,  0x8B,  0x24,  0xB7,  0xFB,  0x76,  0xF1,  0x59,
     0x57,  0x1A,  0xE5,  0xED,  0x0E,  0x89,  0xDB,  0xC2,
     0xDE,  0xE6,  0xE6,  0x51,  0x40,  0x00,  0x7A,  0x73,
     0x3D,  0x15,  0x51,  0xC4,  0x9F,  0x2E,  0x95,  0x89
        };

        unsigned char  cb[N] =
        {
     0x68,  0x87,  0x6A,  0x41,  0x2A,  0xD7,  0xFD,  0x50,
     0xFE,  0xC2,  0x1C,  0x0A,  0xE5,  0x7E,  0x85,  0xF6,
     0x4A,  0x25,  0x01,  0xCA,  0xC9,  0x8B,  0x48,  0x49,
     0xBE,  0x85,  0xD6,  0x80,  0xBB,  0xCF,  0xE9,  0xA2,
     0x4E,  0x4A,  0x06,  0x82,  0x82,  0xD1,  0xCC,  0xD1,
     0xE9,  0xFD,  0x30,  0x8D,  0x40,  0x49,  0xD4,  0x8B,
     0xEA,  0xDD,  0xA4,  0x54,  0xA9,  0xB1,  0xEA,  0x8A,
     0x37,  0x58,  0x6F,  0xB4,  0x8F,  0x56,  0x6E,  0x6E
        };

        unsigned char  cr[N] =
        {
     0x15,  0x9B,  0xE5,  0x37,  0xBE,  0x69,  0xA8,  0x0A,
     0x5E,  0x2F,  0x7C,  0x6A,  0x7B,  0x98,  0x84,  0xD3,
     0xEF,  0x7F,  0x75,  0x1B,  0x0F,  0x6E,  0x35,  0xB7,
     0xB4,  0x89,  0x22,  0x59,  0x04,  0x4C,  0xD8,  0xDB,
     0x7A,  0x57,  0x69,  0xE6,  0x8C,  0x03,  0xBD,  0x4A,
     0x37,  0xE6,  0xE1,  0x87,  0x9F,  0x52,  0xEE,  0xEE,
     0x10,  0x09,  0xEB,  0x73,  0x0B,  0x46,  0x5A,  0xD0,
     0x9D,  0x6B,  0x64,  0x0D,  0x82,  0x41,  0x2D,  0xDC
        };

        unsigned short  rgb_c[N];

	unsigned short  rgb_c_expected[N] = { 640, 1152, 45938, 65407, 64076, 64369, 3712, 16358, 64544, 64576, 29759, 50943, 60127, 41151, 1312, 1600, 30, 95, 3551, 34815, 25728, 17312, 17696, 11360, 6206, 27263, 52404, 27048, 23180, 25293, 64607, 36895, 63744, 64068, 4544, 50977, 65506, 25984, 26623, 1117, 1180, 595, 57343, 59391, 640, 5859, 65199, 64972, 64895, 64959, 65407, 23050, 796, 211, 15567, 13454, 1045, 655, 701, 32511, 63935, 43038, 64027, 63930 };

int main(int argc, char** argv) {

        #pragma monitor start
	IMG_ycbcr422p_rgb565_c(coef, y, cb, cr, rgb_c, N);
        #pragma monitor stop

	if (argc > 42 && ! strcmp(argv[0], ""))	printf("%hu", rgb_c[N-1]);

	int i;
	for(i=0; i < N; i++) {
//                printf("%hu, ", rgb_c[i]);
			if(rgb_c[i] != rgb_c_expected[i]) {
					return 1;
			}
	}
	return 10;

}
