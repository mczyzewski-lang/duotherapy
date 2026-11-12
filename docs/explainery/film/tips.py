#!/usr/bin/env python3
"""Krótkie porady DUO v2 (hook + porada + CTA: zapisz/wyślij albo „skomentuj SŁOWO” z okładką materiału).
Użycie: python3 tips.py plan | tl T01 … | build T01 …"""
import json,os,subprocess,sys,shutil,re
import numpy as np
FPS=30;LEAD=0.25
def sh(c): subprocess.run(c,shell=True,check=True)
def load(f): return np.frombuffer(subprocess.run(['ffmpeg','-nostdin','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,dtype=np.float32)
H,T,C_='hook','tip','cta'
TIPS={
 'T01':dict(A='hE1',B='tB01',cta='save',hook=(['Kłótnia','wymyka się','spod kontroli?'],2),card=(['„Potrzebuję 20 minut.','Wrócę do tej rozmowy.”'],0),cardAt=2,units=[
   (H,'Kłótnia wymyka się spod kontroli?'),(T,'Powiedz jedno zdanie:'),(T,'„Potrzebuję 20 minut. Wrócę do tej rozmowy.”'),(T,'I naprawdę wróć.'),(T,'Przerwa to nie ucieczka, tylko hamulec.'),(C_,'Zapisz ten film, zanim znów się przyda.')]),
 'T02':dict(A='tA02',B='tB02',cta='share',hook=(['Mówisz','„ty nigdy”','i „ty zawsze”?'],2),card=(['Zamiast „ty nigdy…”','„Pomożesz mi dziś?”'],1),cardAt=3,units=[
   (H,'Mówisz: ty nigdy, i: ty zawsze?'),(T,'Te dwa słowa zamykają rozmowę, zanim się zacznie.'),(T,'Zamiast: „nigdy mi nie pomagasz”, powiedz:'),(T,'„Jestem zmęczona. Pomożesz mi dziś z kolacją?”'),(T,'Jedna konkretna prośba zamiast oceny.'),(C_,'Wyślij to osobie, z którą chcesz się lepiej dogadać.')]),
 'T03':dict(A='hC',B='tB03',cta='save',hook=(['Trzeci dzień','ciszy','w domu?'],1),card=(['„Nie chcę, żebyśmy','tak milczeli.”'],1),cardAt=3,units=[
   (H,'Trzeci dzień ciszy w domu?'),(T,'Nie czekaj na idealne słowa. Nie przyjdą.'),(T,'Wystarczy jedno zdanie:'),(T,'„Nie chcę, żebyśmy tak milczeli.”'),(T,'Nie musisz od razu wyjaśniać wszystkiego.'),(T,'Wystarczy otworzyć drzwi.'),(C_,'Zapisz to zdanie na później.')]),
 'T04':dict(A='tA04',B='tB04',cta='share',hook=(['Rozmawiacie już tylko','o dzieciach','i rachunkach?'],2),card=(['10 minut dziennie','„Co dziś było','dla Ciebie ważne?”'],0),cardAt=1,units=[
   (H,'Rozmawiacie już tylko o dzieciach i rachunkach?'),(T,'Dziesięć minut dziennie.'),(T,'Bez telefonów, bez listy zadań.'),(T,'I jedno pytanie: „Co dziś było dla Ciebie ważne?”'),(T,'Tylko słuchaj. Nie naprawiaj.'),(C_,'Wyślij to mężowi albo żonie i zacznijcie dziś wieczorem.')]),
 'T05':dict(A='tA05',B='tB05',cta='save',hook=(['Po kłótni','każde idzie','w swój kąt?'],2),card=(['„Przepraszam za ton.','Dokończmy spokojnie.”'],0),cardAt=3,units=[
   (H,'Po kłótni każde idzie w swój kąt?'),(T,'Najważniejsza jest pierwsza doba.'),(T,'Wróć z jednym zdaniem:'),(T,'„Przepraszam za ton. Chcę dokończyć tę rozmowę spokojnie.”'),(T,'Przepraszasz za sposób, a nie za to, że masz swoje zdanie.'),(C_,'Zapisz na następny raz.')]),
 'T06':dict(A='tA06',B='tB06',cta='share',hook=(['Każde','„musimy porozmawiać”','kończy się kłótnią?'],2),card=(['Zamiast zarzutu:','„Martwię się o nas.”'],1),cardAt=3,units=[
   (H,'Każde: musimy porozmawiać, kończy się kłótnią?'),(T,'Pierwsze zdanie ustawia całą rozmowę.'),(T,'Zacznij od siebie, nie od zarzutu.'),(T,'„Martwię się o nas” zamiast „znowu to zrobiłeś”.'),(T,'Zarzut wywołuje obronę. Troska – rozmowę.'),(C_,'Wyślij to komuś, komu się przyda.')]),
 'T07':dict(A='tA07',B='tB07',cta='share',hook=(['Kiedy ostatnio','powiedzieliście sobie','„dziękuję”?'],2),card=(['Raz dziennie','jedno konkretne','„dziękuję”'],2),cardAt=1,units=[
   (H,'Kiedy ostatnio powiedzieliście sobie: dziękuję?'),(T,'Raz dziennie zauważ jedną konkretną rzecz.'),(T,'Nie: „dzięki za wszystko”.'),(T,'Tylko: „dziękuję, że odebrałeś dzieci”.'),(T,'Konkret pokazuje, że naprawdę widzisz drugą osobę.'),(C_,'Wyślij to osobie, której chcesz dziś podziękować.')]),
 'T08':dict(A='tA08',B='tB08',cta='save',hook=(['Słuchasz,','czy tylko czekasz','na swoją kolej?'],2),card=(['Najpierw powtórz:','„Czyli chodzi Ci','o to, że…”'],0),cardAt=2,units=[
   (H,'Słuchasz, czy tylko czekasz na swoją kolej?'),(T,'Zanim odpowiesz, powtórz własnymi słowami to, co słyszysz.'),(T,'„Czyli chodzi Ci o to, że…”'),(T,'Dopiero potem powiedz swoje.'),(T,'Często już to zmienia ton rozmowy.'),(C_,'Zapisz i wypróbuj dziś wieczorem.')]),
 'T09':dict(A='tA09',B='tB09',cta='share',hook=(['„Ja robię w domu','wszystko.”','Oboje tak mówicie?'],2),card=(['Jedna kartka.','Wszystkie obowiązki.','Potem rozmowa.'],0),cardAt=2,units=[
   (H,'Ja robię w domu wszystko. Oboje tak mówicie?'),(T,'Każde z Was widzi głównie swoją część.'),(T,'Spiszcie na jednej kartce wszystko, co robicie w domu.'),(T,'Naprawdę wszystko.'),(T,'Dopiero potem rozmawiajcie o podziale.'),(T,'O liście, nie o sobie.'),(C_,'Wyślij to swojej drugiej połowie.')]),
 'T10':dict(A='hH',B='tB10',cta='save',hook=(['Jesteście już','tylko','mamą i tatą?'],2),card=(['1 godzina w tygodniu','tylko dla Was'],0),cardAt=1,units=[
   (H,'Jesteście już tylko mamą i tatą?'),(T,'Wpiszcie do kalendarza jedną godzinę w tygodniu tylko dla Was.'),(T,'Jak wizytę, której się nie odwołuje.'),(T,'Nie musi być kolacja w mieście.'),(T,'Wystarczy spacer bez telefonów.'),(C_,'Zapisz i wpiszcie termin jeszcze dziś.')]),
 'T11':dict(A='tA11',B='tB11',magnet=('rozmowa-o-pieniadzach','PIENIĄDZE',['12 pytań do rozmowy','o pieniądzach']),hook=(['Znowu kłótnia','o pieniądze?'],1),units=[
   (H,'Znowu kłótnia o pieniądze?'),(T,'Zanim zaczniecie liczyć, zadajcie sobie jedno pytanie:'),(T,'„Co pieniądze dla Ciebie znaczą? Bezpieczeństwo? Wolność?”'),(T,'Rzadko kłócicie się o kwoty. Częściej o to, co za nimi stoi.'),(C_,'Jeżeli chcesz bezpłatnie 12 pytań do rozmowy o pieniądzach, skomentuj: pieniądze.')]),
 'T12':dict(A='tA12',B='tB12',magnet=('granice-z-rodzina','GRANICE',['Poradnik:','granice z rodziną']),hook=(['Święta u rodziny','i znowu','spięcie?'],2),units=[
   (H,'Święta u rodziny i znowu spięcie?'),(T,'Ustalcie wcześniej jedno zdanie, które mówicie razem:'),(T,'„Ustalimy to we dwoje i damy znać.”'),(T,'Granice stawia się razem, a nie przeciwko sobie.'),(C_,'Jeżeli chcesz bezpłatnie poradnik o granicach z rodziną, skomentuj: granice.')]),
 'T13':dict(A='tA13',B='tB13',magnet=('klotnie-przy-dzieciach','DZIECI',['Plan na trudne momenty','przy dzieciach']),hook=(['Kłócicie się','przy dzieciach?'],1),card=(['Hasło „stop”.','Do tematu wracacie','we dwoje.'],0),cardAt=1,units=[
   (H,'Kłócicie się przy dzieciach?'),(T,'Umówcie się na hasło „stop”. Jedno słowo, po którym oboje przerywacie.'),(T,'Do tematu wracacie później, we dwoje.'),(T,'A dziecku powiedzcie: „To nie Twoja wina.”'),(C_,'Jeżeli chcesz bezpłatnie plan na trudne momenty przy dzieciach, skomentuj: dzieci.')]),
 'T14':dict(A='hE1',B='tB14',magnet=('7-zdan-w-klotni','ZDANIA',['7 zdań, które','zatrzymują kłótnię']),hook=(['Jedno zdanie','potrafi zatrzymać','kłótnię.'],2),units=[
   (H,'Jedno zdanie potrafi zatrzymać kłótnię.'),(T,'Powiedz je, zanim padnie o jedno słowo za dużo:'),(T,'„Zależy mi na Tobie bardziej niż na tym, żeby mieć rację.”'),(T,'To nie kapitulacja. To zmiana kierunku.'),(C_,'Jeżeli chcesz bezpłatnie siedem takich zdań, skomentuj: zdania.')]),
 'T15':dict(A='hB',B='tB15',magnet=('petla-konfliktu','PĘTLA',['Rozpisz Waszą','pętlę konfliktu']),hook=(['Kłócicie się','ciągle','o to samo?'],2),units=[
   (H,'Kłócicie się ciągle o to samo?'),(T,'Następnym razem zatrzymaj się i zapytaj:'),(T,'„O co nam naprawdę chodzi?”'),(T,'Rzadko o zmywarkę. Częściej o to, czy jestem dla Ciebie ważna.'),(C_,'Jeżeli chcesz bezpłatnie rozpisać Waszą pętlę konfliktu, skomentuj: pętla.')]),
 'T16':dict(A='tA16',B='tB16',magnet=('bliskosc-po-dziecku','BLISKOŚĆ',['10 małych rytuałów','bliskości']),hook=(['Od narodzin dziecka','mijacie się','w drzwiach?'],2),card=(['Najpierw przytul.','Potem pytaj','o zakupy.'],0),cardAt=1,units=[
   (H,'Od narodzin dziecka mijacie się w drzwiach?'),(T,'Zacznijcie od powitania. Zanim zapytasz o zakupy, przytul.'),(T,'Kilka sekund, codziennie.'),(T,'Bliskość wraca w małych rytuałach, a nie w wielkich planach.'),(C_,'Jeżeli chcesz bezpłatnie dziesięć takich rytuałów, skomentuj: bliskość.')]),
 'T17':dict(A='tA17',B='tB17',magnet=('jezyk-potrzeb','POTRZEBY',['Ściąga: jak mówić','o swoich potrzebach']),hook=(['Liczysz, że','druga strona','sama się domyśli?'],2),units=[
   (H,'Liczysz, że druga strona sama się domyśli?'),(T,'Nikt nie czyta w myślach. Powiedz wprost, czego potrzebujesz:'),(T,'„Potrzebuję, żebyś mnie dziś po prostu przytulił.”'),(T,'Prośba to nie słabość. To drogowskaz.'),(C_,'Jeżeli chcesz bezpłatnie ściągę takich zdań, skomentuj: potrzeby.')]),
 'T18':dict(A='s01',B='tB18',magnet=('cicha-separacja','SYGNAŁY',['10 sygnałów','cichej separacji']),hook=(['Nie kłócicie się.','I właśnie to','Cię niepokoi?'],2),card=(['Kiedy ostatnio','rozmawialiście','nie o domu i dzieciach?'],1),cardAt=2,units=[
   (H,'Nie kłócicie się. I właśnie to Cię niepokoi?'),(T,'Sprawdź jedną rzecz.'),(T,'Kiedy ostatnio opowiedzieliście sobie coś, co nie dotyczyło domu ani dzieci?'),(T,'Cisza bywa głośniejszym sygnałem niż kłótnia.'),(C_,'Jeżeli chcesz bezpłatnie dziesięć sygnałów cichej separacji, skomentuj: sygnały.')]),
 'T19':dict(A='tA19',B='tB19',magnet=('trudna-rozmowa','ROZMOWA',['Plan','trudnej rozmowy']),hook=(['Zaczynasz','trudną rozmowę','w drzwiach?'],2),units=[
   (H,'Zaczynasz trudną rozmowę w drzwiach?'),(T,'Moment ma znaczenie. Zapytaj najpierw:'),(T,'„Kiedy masz dziś 20 minut? Chcę porozmawiać o czymś ważnym.”'),(T,'Rozmowa umówiona to rozmowa, do której oboje jesteście gotowi.'),(C_,'Jeżeli chcesz bezpłatnie plan trudnej rozmowy, skomentuj: rozmowa.')]),
 'T20':dict(A='s03a',B='tB20',magnet=('mapa-trzech-drog','MAPA',['Mapa trzech dróg']),hook=(['Nie wiesz,','czy ratować,','czy odejść?'],2),card=(['Nie decyduj w nocy.','Zapisz. Wróć rano.'],1),cardAt=1,units=[
   (H,'Nie wiesz, czy ratować, czy odejść?'),(T,'Nie podejmuj tej decyzji w nocy ani w złości.'),(T,'Zapisz ją na kartce i wróć do niej rano.'),(T,'Najpierw sprawdź, w którym miejscu naprawdę jesteście.'),(C_,'Jeżeli chcesz bezpłatnie Mapę trzech dróg, skomentuj: mapa.')]),
}
# dymek z cytatem: nr jednostki z cytatem i punkt (x,y) nad głową mówiącej postaci w kadrze B
BUB={'T01':(2,750,850),'T02':(3,685,868),'T03':(3,722,884),'T04':(3,666,776),'T05':(3,285,765),'T06':(3,601,866),'T07':(3,648,846),'T08':(2,351,846),
     'T11':(2,694,846),'T12':(2,583,820),'T13':(3,648,832),'T14':(2,676,784),'T15':(2,648,836),'T17':(2,611,802),'T19':(2,652,886)}
# karta-nagłówek zostaje tylko tam, gdzie nie powtarza cytatu z dymka
CARD_KEEP={'T04':(['10 minut dziennie','bez telefonów'],0),'T09':None,'T10':None,'T13':None,'T16':None,'T18':None,'T20':None}
AMB={'T02':'kitchen','T09':'kitchen','T15':'kitchen','T10':'birds','T20':'birds'}
CTA_TXT={'save':'Zapisz na później','share':'Wyślij dalej'}
def align(k):
    x=load(f'tips/{k}.mp3');fr=np.array([np.sqrt((x[i:i+320]**2).mean()) for i in range(0,len(x)-320,320)]);sp=fr>0.012
    idx=np.where(sp)[0];a0,b0=idx[0],idx[-1]+1
    sil=[];i=a0
    while i<b0:
        if not sp[i]:
            j=i
            while j<b0 and not sp[j]: j+=1
            if (j-i)*0.02>=0.2: sil.append((i*0.02,j*0.02))
            i=j
        else: i+=1
    real=np.arange(len(sp))*0.02;spt=np.cumsum(sp)*0.02;S=spt[b0-1]
    units=TIPS[k]['units'];w=[len(re.sub(r'[^a-ząćęłńóśźż0-9]','',u[1].lower())) for u in units];cum=np.cumsum(w)/sum(w)
    bounds=[];used=-1
    for c in cum[:-1]:
        t=real[np.searchsorted(spt,c*S)]
        best=None
        for si in range(used+1,len(sil)):
            mid=(sil[si][0]+sil[si][1])/2
            if abs(mid-t)<=0.9 and (best is None or abs(mid-t)<abs((sil[best][0]+sil[best][1])/2-t)): best=si
        if best is not None: bounds.append(sil[best]);used=best
        else: bounds.append((t-0.03,t+0.03))
    st=[a0*0.02]+[b[1] for b in bounds];en=[b[0] for b in bounds]+[b0*0.02]
    lv=20*np.log10(np.sqrt((fr[sp]**2).mean()))
    return [(s+LEAD,e+LEAD) for s,e in zip(st,en)],float(lv),len(sil)
def words(text,s,e):
    ws=text.split();w=[len(re.sub(r'[^a-ząćęłńóśźż0-9]','',x.lower()))+1.5 for x in ws];c=np.concatenate([[0],np.cumsum(w)])/sum(w)
    return [[x,round(s+(e-s)*c[i],3),round(s+(e-s)*c[i+1],3)] for i,x in enumerate(ws)]
def timeline(k):
    cfg=TIPS[k];seg,lv,ns=align(k);units=cfg['units'];ft=next(i for i,u in enumerate(units) if u[0]==T);ci=len(units)-1
    mg=cfg.get('magnet');tA=round(seg[ft][0]-0.12,3);dur=round((seg[-1][1]+(2.0 if mg else 1.3))*FPS)/FPS;hl,hp=cfg['hook'];hd=seg[0][1]-seg[0][0];n=len(hl)
    def clip(name):
        d=f'clips/{name}';c=len(os.listdir(d)) if os.path.isdir(d) else 0
        return dict(n=c,fps=30,dur=round((c-1)/30,3)) if c else None
    cB=clip(cfg['B'])
    tl=dict(dur=dur,A=dict(img=cfg['A'],a=0,b=tA,clip=clip(cfg['A'])),B=dict(img=cfg['B'],a=tA,b=dur,clip=cB,tau=round(max(cB['dur']*0.9,(dur-tA)/2.3),3)),
      hook=dict(lines=hl,pill=hp,times=[0 if i==0 else round(0.25+hd*(i/n)*0.5,3) for i in range(n)]),logoAt=round(tA+0.9,3))
    bq=BUB.get(k);caps=[]
    for i in range(ft,ci):
        ws=words(units[i][1],seg[i][0],seg[i][1]+0.05)
        if bq and bq[0]==i:
            q0=next(j for j,w in enumerate(ws) if w[0].startswith('„'));q1=next(j for j in range(q0,len(ws)) if '”' in w_(ws[j]))
            tl['bubble']=dict(t0=round(ws[q0][1]-0.12,3),words=ws[q0:q1+1],tail=[bq[1],bq[2]])
            parts=[ws[:q0],ws[q1+1:]]
        else: parts=[ws]
        for p in parts:
            if p: caps.append(dict(a=round(p[0][1]-0.03,3),b=round(p[-1][2]+0.05,3),words=p))
    tl['caps']=caps
    card=CARD_KEEP[k] if k in CARD_KEEP else None
    if k in CARD_KEEP and card is None: card=cfg.get('card')
    if card: tl['card']=dict(lines=card[0],pill=card[1],t0=round(seg[cfg['cardAt']][0],3))
    if mg:
        cw=words(units[ci][1],seg[ci][0],seg[ci][1]);chip=next(w[1] for w in cw if w[0].lower().startswith('skomentuj'))
        tl['cta']=dict(type='magnet',cover=mg[0],word=mg[1],title=mg[2],t0=round(seg[ci][0]-0.1,3),chipAt=round(chip-0.1,3))
    else: tl['cta']=dict(type=cfg['cta'],text=CTA_TXT[cfg['cta']],t0=round(seg[ci][0]-0.05,3))
    return tl,lv,seg,ns
def w_(x): return x[0]
_LV={}
def lvl(f):
    if f not in _LV: x=load(f);_LV[f]=20*np.log10(max(1e-6,np.sqrt((x**2).mean())))
    return _LV[f]
def audio(k,tl,lv,out):
    D=tl['dur'];g=-15.0-lv;hp=tl['hook']['pill'];c=tl['cta'];mg=c['type']=='magnet'
    acc=[('pop',tl['hook']['times'][hp]+0.02 if hp else tl['hook']['times'][-1]+0.02,.3),('whoosh',tl['A']['b']-0.1,.8)]
    if 'bubble' in tl: acc.append(('pop',tl['bubble']['t0']+0.05,.34))
    if 'card' in tl: acc.append(('pop',tl['card']['t0']+0.02,.3))
    if mg: acc+=[('whoosh',c['t0']+0.05,.6),('cover',c['t0']+0.55,10**((-22-lvl('sfx_cover.mp3'))/20)),('chime',c['chipAt']-0.05,.32),('pop',c['chipAt']+0.05,.34)]
    else: acc+=[('chime',c['t0']-0.05,.32),('pop',c['t0']+0.05,.34)]
    amb=AMB.get(k,'home');ga=(-37 if amb=='home' else -35)-lvl(f'sfx_{amb}.mp3');gt=-29-lvl('sfx_tension.mp3');tA=tl['A']['b']
    ins=f"-i tips/{k}.mp3 -ss 42 -i music.mp3 -stream_loop -1 -i sfx_{amb}.mp3 -i sfx_tension.mp3"
    f=(f"[0:a]volume={g:.2f}dB,adelay={int(LEAD*1000)}:all=1[v];[1:a]atrim=0:{D:.2f},asetpts=PTS-STARTPTS,volume=0.13,afade=t=in:d=0.6,afade=t=out:st={D-1.3:.2f}:d=1.3[m];"
       f"[2:a]atrim=0:{D:.2f},asetpts=PTS-STARTPTS,volume={ga:.2f}dB,afade=t=in:st={max(0,tA-0.3):.2f}:d=1.0,afade=t=out:st={D-1.2:.2f}:d=1.2[amb];"
       f"[3:a]atrim=0:{min(4.0,tA+0.4):.2f},volume={gt:.2f}dB,afade=t=in:d=0.15,afade=t=out:st={max(0.3,tA-0.4):.2f}:d=0.8[tn];")
    mix="[v][m][amb][tn]";n=4
    for name,t,v in acc: ins+=f" -i sfx_{name}.mp3";f+=f"[{n}:a]volume={v:.3f},adelay={int(max(0,t)*1000)}:all=1[a{n}];";mix+=f"[a{n}]";n+=1
    f+=f"{mix}amix=inputs={n}:normalize=0:duration=longest,alimiter=limit=0.95[out]"
    sh(f"ffmpeg -nostdin -v error -y {ins} -filter_complex \"{f}\" -map \"[out]\" -t {D:.3f} -c:a aac -b:a 192k -ar 48000 {out}")
def build(k):
    tl,lv,seg,ns=timeline(k);p=f'tips/tl_{k}.json';json.dump(tl,open(p,'w'),ensure_ascii=False,indent=1)
    N=round(tl['dur']*FPS);fd=f'fr_{k}';shutil.rmtree(fd,ignore_errors=True);os.makedirs(fd);q=[0,N//3,2*N//3,N]
    pr=[subprocess.Popen(f"PAGE=tips.html TL={p} OUT={fd} node render.js frames {q[i]} {q[i+1]}",shell=True,stdout=subprocess.DEVNULL) for i in range(3)]
    audio(k,tl,lv,f'tips/mix_{k}.m4a')
    for x in pr: x.wait()
    assert len(os.listdir(fd))==N,(len(os.listdir(fd)),N)
    os.makedirs('out_tips',exist_ok=True);out=f'out_tips/duo-porada-{k}.mp4'
    sh(f"ffmpeg -nostdin -v error -y -framerate 30 -i {fd}/f%05d.jpg -i tips/mix_{k}.m4a -c:v libx264 -preset medium -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy -shortest {out}")
    shutil.rmtree(fd);print(k,'->',out,'%.1f s'%tl['dur'],flush=True)
if __name__=='__main__':
    m=sys.argv[1];ks=sys.argv[2:] or list(TIPS)
    if m=='plan':
        for k in ks:
            tl,lv,seg,ns=timeline(k);print(k,'dur %.1f'%tl['dur'],'tA %.2f'%tl['A']['b'],'units',len(seg),'silences',ns,'|',' '.join('%.1f-%.1f'%s for s in seg))
    elif m=='tl':
        for k in ks: tl,*_=timeline(k);json.dump(tl,open(f'tips/tl_{k}.json','w'),ensure_ascii=False,indent=1)
    elif m=='build':
        for k in ks: build(k)
