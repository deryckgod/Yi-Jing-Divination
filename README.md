# 觀音易經聖卦

## 網格製作網頁
https://cssgridgenerator.io/

## 農民曆插件
https://github.com/mumuy/calendar

## 世應邏輯 PROMPT:
```
世應div60-65，我希望從原爻的div66-71得出，原爻主要分陽與陰，陽為["/","O"]，陰為["//","X"]，當"/"與"O"比對時，判定為相同，同為陽，如果是"//"與"O"，則不同，因為一個陰，一個陽。

接著邏輯上71為初(一)爻-下卦地，70為二爻-下卦人、69為三爻-下卦天、68為四爻-上卦地、67為五爻-上卦人、66為上(六)爻-上卦天，"世"與"應"的邏輯有以下幾種，接下來相同指的是兩者皆屬陽或皆屬陰:

1.當上下卦天相同，人跟地不同時，世會在二爻的位置也就是div64，應會在五爻div61；反之上下卦天不同，人跟地相同時，世會在五爻div61，應會在二爻div64

2.當上下卦人相同，天跟地不同時，世會在四爻的位置div62，應會在初爻div65；反之上下卦人不同，天跟地相同時，世會在三爻div63，應會在上爻div60

3.當上下卦地相同，天跟人不同時，世會在四爻的位置div62，應會在初爻div65；反之上下卦地不同，天跟人相同時，世會在初爻div65，應會在四爻div62

4.當上下卦天、地、人都相同，世會在上爻div60，應會在三爻div63；反之上下卦天、地、人都不相同，世會在三爻div63，應會在上爻div60
```

## 首卦邏輯 PROMPT:
```
首卦div26邏輯，要根據世的位置判斷，當世在初爻、二爻、上爻時，直接取上卦作為首卦，例如上卦為111，則首卦為乾卦；當世在四爻、五爻時，將下卦陰變陽、陽變陰後，得首卦，例如下卦為101，經過陰陽對調後，變010，則首卦為坎卦；當世在三爻有兩種情況，如果上下卦的天地人都不同，那首卦取上卦，如果不是剛剛的情況則取下卦為首卦
```

## 取用神邏輯 PROMPT:
```
用神資訊mainGodInfo邏輯為找出與div28的用神五行相同者，優先順序如下:

1.動爻("O"、"X")之原爻干支div59-54，如果有兩個以上，優先順序1.以跟空亡兩個地支同字，沒有的話再看世，2.世在div65-60與該干支同一ROW，沒有的話再看應，3.應在div65-60與該干支同一ROW，沒有的話，4.由下往上取第一個，並組合對應六親

2.靜爻("/"、"//")之原爻干支div59-54，如果有兩個以上，優先順序1.以跟空亡兩個地支同字，沒有的話再看世，2.世在div65-60與該干支同一ROW，沒有的話再看應，3.應在div65-60與該干支同一ROW，沒有的話，4.由下往上取第一個，並組合對應六親

3.看日辰div12的地支，如果與div28同五行即為所得，結果會記錄日辰地支+div28的六親

4.看月建div10的地支，如果與div28同五行即為所得，結果會記錄月建地支+div28的六親

5.變爻干支div83-78與用神div28六親五行相同，如果有兩個以上，由下往上取第一個，並組合對應同一ROW六親

6.取伏神，並在mainGodInfo寫上伏神
```

## 動化分數邏輯 PROMPT:
```
動化分數如果原爻是("O"或"X")時，會依據該爻對應六親DIV28-32所在的神DIV20-24(用神(+15)、原神(+10)、忌神(-15)、仇神(-10)、閒神(-5))給予基本分數，然後再看原爻干支對變爻干支的生剋關係，邏輯有:

1.伏吟(該爻原爻地支與變爻地支同字)，分數*100%

2.化進神(該爻原爻地支五行與變爻地支五行相同，且順序為按照12地支的正序，例如:原爻地支為辰(五行:土) 變爻地支為戌(五行:土)，這兩個地支辰比戌優先，所以為"化進神"，分數*100%)

3.化退神(該爻原爻地支五行與變爻地支五行相同，且順序為按照12地支的倒序，例如:原爻地支為戌(五行:土) 變爻地支為丑(五行:土)，這兩個地支丑比戌優先，順序為倒過來的，所以為"化退神"，分數*90%)

4.化洩(該爻原爻地支五行與變爻地支五行不同，且原爻地支五行生變爻地支五行，例如:原爻地支為辰(五行:土) 變爻地支為申(五行:金)，五行中土生金，所以為"化洩"，正負號放外面，裡面數字-2)

5.化制(該爻原爻地支五行與變爻地支五行不同，且原爻地支五行剋變爻地支五行，例如:原爻地支為辰(五行:土) 變爻地支為亥(五行:水)，五行中土剋水，所以為"化制"，正負號放外面，裡面數字-3)

6.回頭生(該爻原爻地支五行與變爻地支五行不同，且變爻地支五行生原爻地支五行，例如:原爻地支為辰(五行:土) 變爻地支為午(五行:火)，五行中火生土，變爻回頭生原爻，所以為"回頭生"，分數*100%)

7.回頭剋(該爻原爻地支五行與變爻地支五行不同，且變爻地支五行剋原爻地支五行，例如:原爻地支為辰(五行:土) 變爻地支為寅(五行:木)，五行中木剋土，變爻回頭剋原爻，所以為"回頭剋"，分數*10%)

8.空化空(原爻地支與空亡地支皆有空亡，則該爻直接為"空化空"，分數*1%)

9.化空(變爻地支有空亡，則該爻直接為"化空"，分數*10%)

10.空動(原爻地支有空亡，則該爻直接為"空動"，分數*10%)

11.沖散(原爻地支有沖，則該爻為前面7種情況的分數再乘10%，並多紀錄"沖散"，如果有8或9的情況則以8或9情況優先)

12.沖實(原爻地支有空亡也有沖，則該爻為前面7種情況的分數再乘90%，並多紀錄"沖實"，如果有8或9的情況則以8或9情況優先)

上面各種情況的動化邏輯，如果有發生要記錄在同一ROW的DIV first-yao~ sixth-yao裡，另外例外分數為用神的六親如果是1.回頭剋、2.化空、3.空化空，則分數直接為-15。

如果原爻是靜爻("/"、"//")時，原爻地支有沖，則邏輯如下:

1.暗動(原爻地支與DIV15同字為沖，即為"暗動"，分數*20%)

2.空暗動(原爻地支與DIV15同字為沖，且也有與空亡地支同字，即為"空暗動"，分數*2%)

上面各種情況的動化邏輯，如果有發生要記錄在同一ROW的DIV first-yao~ sixth-yao裡。
```

## 入墓入絕 PROMPT
```
先建立地支入墓、入絕的對應，例如: "亥" 五行為水會入"辰"墓、入"巳"絕；入墓入絕規則，為下面幾種情況

1.取用神的原爻地支入日辰地支墓、絕，日辰sunInfo會等於50分

2.動爻("O"、"X")間入墓、絕:

(1)非用神六親的原爻地支入有入日墓、絕或或其他動爻地支的墓、絕，則非用神六親的動化分數要乘10%

(2)如果用神是動爻且入日墓、絕，則動化分數直接為-15

(3)用神mainGodInfo的地支，如果入非用神六親的動爻墓、絕，則非用神六親動化分數直接為-15
```

## 三合(貪生、六沖) PROMPT
```
三合邏輯有分三種情況，以下為判斷順序1.日辰三合2.直線三合、3.三角三合，邏輯分別如下:

1.日辰三合: 日辰地支與兩個動爻("O"、"X")的原爻地支DIV59-54中，兩個動爻("O"、"X")地支之間至少有一個靜爻("/"、"//")沒有含動爻("O"、"X")，且兩個動爻的原爻地支與日辰地支構成三合(有四種"寅午戌"、"巳酉丑"、"亥卯未"、"申子辰"，日辰地支與兩個地支，排列組合湊成其一像是"寅、午、戌"即可，順序不論)，同時動爻分數要經過isScoreAboveThreshold檢查為TRUE才可以進行三合；例如:日辰地支DIV12是辰、動爻在初爻、五爻，其他爻沒有動都是靜爻('/'、'//')，且初爻、五爻分數經過檢查為TRUE，同時原爻地支DIV59、DIV55分別是子、申，因此構成"申子辰"三合水局，分數以六親五行為水的用神算分，並乘上1.5倍，而初爻、五爻不計分，將動化分數寫在三合局最下面的爻對應的位置FIRST-YAO，FIFTH-YAO寫五爻、初爻、日辰三合合化"水"局，FIRST-YAO寫初爻、五爻、日辰三合合化"水"局 分數算出1.5倍放上

2.直線三合:三個動爻("O"、"X")的原爻地支DIV59-54中，三個動爻("O"、"X")地支兩兩之間至少有一個靜爻("/"、"//")沒有含動爻("O"、"X")，且三個動爻的原爻地支構成三合(有四種"寅午戌"、"巳酉丑"、"亥卯未"、"申子辰"，日辰地支與兩個地支，排列組合湊成其一像是"寅、午、戌"即可，順序不論)，同時動爻分數要經過isScoreAboveThreshold檢查為TRUE才可以進行三合；

例如:動爻在初爻、三爻、上爻，其他爻沒有動都是靜爻('/'、'//')，且初爻、三爻、上爻分數經過檢查為TRUE，同時原爻地支DIV59、DIV57、DIV54分別是子、辰、申，因此構成"申子辰"三合水局，分數以六親五行為水的用神算分，並乘上1.5倍，而初爻、三爻、上爻不計分，將動化分數寫在三合局最下面的爻對應的位置FIRST-YAO，THIRD-YAO寫三爻、初爻、上爻三合合化"水"局，FIRST-YAO寫初爻、三爻、上爻三合合化"水"局 分數算出1.5倍放上，SIXTH-YAO寫上爻、初爻、三爻三合合化"水"局。

3.三角三合:兩個動爻("O"、"X")的原爻地支DIV59-54中，與兩個動爻的變爻地支中其中一個有構成三合(有四種"寅午戌"、"巳酉丑"、"亥卯未"、"申子辰"，日辰地支與兩個地支，排列組合湊成其一像是"寅、午、戌"即可，順序不論)，兩個動爻("O"、"X")地支兩兩之間至少有一個靜爻("/"、"//")沒有含動爻("O"、"X")，且兩個動爻動爻分數要經過isScoreAboveThreshold檢查為TRUE才可以進行三合

例如:動爻在四爻、上爻，兩爻之間沒有動都是靜爻('/'、'//')，且四爻、上爻分數經過檢查為TRUE，同時原爻地支DIV56、DIV54分別是寅、戌，與四爻的變爻地支"午"，構成"寅午戌"三合"火"局，分數以六親五行為火的用神算分，並乘上1.5倍，而四爻、上爻不計分，將動化分數寫在三合局最下面的爻對應的位置FOURTH-YAO，FOURTH-YAO寫四爻、上爻三合合化"火"局 分數算出1.5倍放上，SIXTH-YAO寫上爻、四爻三合合化"火"局。
```
