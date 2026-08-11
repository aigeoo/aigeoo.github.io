---
title: "Cython: Advanced Todo List Challenge (Writeup)"
description: "a writeup for Advanced Todo List Challenge from Cython CTF"
date: 2024-10-06
lang: ar
tags:
  - ctf
  - web
  - cve
  - python
---

بسم الله القوي العزيز

ضمن تحديات Cython CTF 2 كان تحدي Advanced Todo List احد التحديات المستعصية على الحل، لذلك ارتأيت كتابة هذا المقال شرحًا للتحدي وآلية الحل بمنهجية صارمة!

![meme](/posts/cython-advanced-todo-list-writeup/images/0.jpg "meme")

إن اول ما يلاحظ أن source code معطى ضمن التحدي ثم إن ذلك احتث المبرمج بداخلي على تفحص تلكمُ الملفات بحثًا عن العلم الذي هو بُغيتي ومُناي.

![ls](/posts/cython-advanced-todo-list-writeup/images/1.jpg "ls")

العرب عَرفت القيافة وعُرفت بها، فرحت اقتاف اثر bugs للوصول إلى العلم. بعد اطلاع سريع على ملف server.js تستطيع جازمًا القول بأنه يخلو من ثغرات SQLi لأن معظم الإستعلامات على قواعد البيانات كانت ب prepared statements وذلك ادعى للحماية.

لا اخفيك بدأ يساورني شك في صحة التحدي، وأنه ممكنٌ حلّه، إذ لا ذكر لكلمة "flag" في كل صفحات البرنامج غير أنه موجود في filesystem في هذا المسار:

`/app/flag.txt`

وهذا اوضح لي أن الثغرة لابد أنها RCE إذ لا سبيل للعَلم غيرها.

رحت ابحث في صفحات ال views عن ثغرة SSTI بلا فائدة، ثم رجعت إلى server.js وإذا بي انتبه إلى سطر مريب.

![line](/posts/cython-advanced-todo-list-writeup/images/2.jpg "line")

النظرة الأولية قد تخدعك بأن هذا السطر لا ريب فيه إلا أن البرنامج كتب بلغة javascript وهنا مربط الفرس، حيث أن في javascript كل شيء يرجع في أصله إلى كونه object وكل object يرث بالضرورة أُمورًا قد تضره ويُعرف هذا ب prototype pollution.

لذلك فإنني رحت ابحث عن طريق إلى prototype pollution to RCE حيث يكمن حل التحدي.

بعد محاولات عديدة لإيجاد طريقة لكتابة exploit كلها باءت بالفشل تسربت الوساوس إلى نفسي من قبيل "مو كالفنك يا مسلم" وقبل أن اترك التحدي تذكرت قول الشاعر:

إن الوساوسَ إن رامَت مسارِبَها<br>
سدَّ الطريقَ عليها الحازمُ الحذِرُ

فعدت احتث الخطى إلى source code لكن بطريقة مختلفة، وذهبت انظر في ملف package.json ورحت اقلّص الإحتمالات إلى أمرين اثنين كما هو موضح ادناه:

![packages](/posts/cython-advanced-todo-list-writeup/images/3.jpg "packages")

ابشر بالفرج بعد طول انتظار...

ضاقَت فَلَمّا اِستَحكَمَت حَلَقاتُها<br>
فُرِجَت وَكُنتُ أَظُنُّها لا تُفرَجُ

بعد بحث بسيط، لاح بارق الأمل في الأفق:

![cve](/posts/cython-advanced-todo-list-writeup/images/4.jpg "cve")

لذلك وبناء على ما سبق فإنني بدأت مستعينًا بالله اولًا ثم ب CVE في كتابة exploit يحقق المطلوب:

![local](/posts/cython-advanced-todo-list-writeup/images/5.jpg "local")

ولتجربة exploit والتثبت من الحل فإني عزمت على تشغيله محليًا على جهازي ابتداء ثم الإنتقال الى server المسابقة:

![exploit](/posts/cython-advanced-todo-list-writeup/images/6.jpg "exploit")

![flag](/posts/cython-advanced-todo-list-writeup/images/7.jpg "flag")

وعلى الله قصد السبيل، والسلام.
