-- Styl postaci: właściciel wybrał zaokrąglone maskotki (pierwotny styl, wersja 1) jako docelowy – to wersja 3.
-- Grafiki z wersji 1 są już w tym stylu (nie wymagają odświeżenia); wersja 2 (ludzie z fryzurami) zostaje oznaczona jako „stary styl”.
update article_images set style_version = 3 where style_version = 1;
