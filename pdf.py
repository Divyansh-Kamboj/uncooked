import fitz

doc = fitz.open('MathTest.pdf')

print("Num of pages:", doc.page_count)
last = False
sub = False
pagenum = 2
try:
    while not last:
        paper = open('paper.txt', 'w')
        page = doc.load_page(pagenum)
        paper.write(page.get_text())
        paper.close()
        paper = open("paper.txt", 'r')
        for i in range(4): 
            checkline = paper.readline().strip()
        if checkline == "Additional page":
            last = True
        else:
            for i in range(5): 
                line = paper.readline().strip()
            if line == "" or line[0] == '.':
                sub = True
                pix = page.get_pixmap()
                pix.save(f"{pagenum}_sub.png")
            else:
                pix = page.get_pixmap()
                pix.save(f"{pagenum}.png")
        pagenum += 1


        
        

        
except IOError:
    print("invalid file")