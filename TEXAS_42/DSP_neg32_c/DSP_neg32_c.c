void DSP_neg32_c
(
    const int    *x,
    int * r,
    int           nx
)
{
    int i;
    for (i = 0; i < nx; i++)
          r[i] = -x[i];
}

