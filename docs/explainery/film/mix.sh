#!/bin/bash
# Miks: lektor + podkład muzyczny + tła (mgła, łąka) + akcenty (pop, dzwonek)
D=70.75
pops=(4.89 5.73 6.53 36.21 37.53 38.73 43.61 44.53 45.81)
pv=(0.34 0.34 0.34 0.2 0.2 0.2 0.22 0.22 0.22)
in="-i voice.m4a -i music.mp3 -i sfx_fog.mp3 -i sfx_fog.mp3 -i sfx_birds.mp3 -i sfx_chime.mp3 -i sfx_chime.mp3"
f="[1:a]atrim=0:$D,volume=0.15,afade=t=in:d=1.5,afade=t=out:st=67.5:d=3.2[m];"
f+="[2:a]volume=9,afade=t=in:d=2.5,afade=t=out:st=11:d=3,adelay=11000:all=1[f1];"
f+="[3:a]volume=9,afade=t=in:d=3,afade=t=out:st=5.5:d=2.5,atrim=0:8,adelay=22000:all=1[f2];"
f+="[4:a]volume=4.5,afade=t=in:d=2,afade=t=out:st=14.5:d=3.5,adelay=41200:all=1[b];"
f+="[5:a]volume=0.4,adelay=27500:all=1[c1];[6:a]volume=0.5,adelay=60700:all=1[c2];"
mixin="[0:a][m][f1][f2][b][c1][c2]"; n=7
for i in "${!pops[@]}"; do in+=" -i sfx_pop.mp3"; ms=$(python3 -c "print(int(${pops[$i]}*1000-40))"); f+="[$((7+i)):a]volume=${pv[$i]},adelay=$ms:all=1[p$i];"; mixin+="[p$i]"; n=$((n+1)); done
f+="${mixin}amix=inputs=$n:normalize=0:duration=first,alimiter=limit=0.95[out]"
ffmpeg -v error -y $in -filter_complex "$f" -map "[out]" -c:a aac -b:a 192k -ar 48000 mix.m4a
