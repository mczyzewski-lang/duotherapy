#!/bin/bash
# Miks: lektor + podkład muzyczny + tła (mgła, łąka) + akcenty (pop, szelest cięcia, rozdarcie, dzwonek)
D=70.75
# plik:czas[s]:głośność
acc=(pop:0.86:0.3 tear:1.22:1.6 whoosh:4.62:0.75 pop:4.76:0.34 whoosh:5.57:0.75 pop:5.71:0.34 whoosh:6.37:0.75 pop:6.51:0.34
     pop:9.45:0.26 pop:10.75:0.26 chime:27.5:0.4 pop:36.21:0.2 pop:37.53:0.2 pop:38.73:0.2 pop:43.61:0.22 pop:44.53:0.22 pop:45.81:0.22 chime:60.7:0.5)
in="-i voice2.m4a -i music.mp3 -i sfx_fog.mp3 -i sfx_fog.mp3 -i sfx_birds.mp3"
f="[1:a]atrim=0:$D,volume=0.15,afade=t=in:d=1.5,afade=t=out:st=67.5:d=3.2[m];"
f+="[2:a]volume=9,afade=t=in:d=2.5,afade=t=out:st=11:d=3,adelay=11000:all=1[f1];"
f+="[3:a]volume=9,afade=t=in:d=3,afade=t=out:st=5.5:d=2.5,atrim=0:8,adelay=22000:all=1[f2];"
f+="[4:a]volume=4.5,afade=t=in:d=2,afade=t=out:st=14.5:d=3.5,adelay=41200:all=1[b];"
mixin="[0:a][m][f1][f2][b]"; n=5
for a in "${acc[@]}"; do IFS=: read name at vol <<< "$a"; in+=" -i sfx_$name.mp3"; ms=$(python3 -c "print(int($at*1000))"); f+="[$n:a]volume=$vol,adelay=$ms:all=1[a$n];"; mixin+="[a$n]"; n=$((n+1)); done
f+="${mixin}amix=inputs=$n:normalize=0:duration=first,alimiter=limit=0.95[out]"
ffmpeg -nostdin -v error -y $in -filter_complex "$f" -map "[out]" -c:a aac -b:a 192k -ar 48000 mix.m4a
