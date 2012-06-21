from inkle.models import *
import shutil

def load_members():
    for line in open("senchaDatabaseData/members.txt", "r"):
        data = [x.strip() for x in line.split("|")]
        m = Member(first_name = data[0], last_name = data[1], username = data[2], email = data[3], birthday = datetime.date(day = int(data[4]), month = int(data[5]), year = int(data[6])), gender = data[7], verified = data[8], is_staff = data[9])
        m.set_password("password")
        m.update_verification_hash()
        m.save()
        if (data[7] == "Male"):
            shutil.copyfile("inkle/static/media/images/main/man.jpg", "inkle/static/media/images/members/" + str(m.id) + ".jpg")
        else:
            shutil.copyfile("inkle/static/media/images/main/woman.jpg", "inkle/static/media/images/members/" + str(m.id) + ".jpg")


def load_blots():
    for line in open("senchaDatabaseData/blots.txt", "r"):
        data = [x.strip() for x in line.split("|")]
        b = Blot(name = data[0])
        b.save()

        m = Member.objects.get(pk = data[1])
        m.blots.add(b)


def load_inklings():
    for line in open("senchaDatabaseData/inklings.txt", "r"):
        data = [x.strip() for x in line.split("|")]
        l = Location(name = data[0])
        l.save()
        i = Inkling(date = datetime.date.today(), location = l, time = data[1], category = data[2], notes = data[3], is_private = data[4])
        i.save()


def load_member_inklings():
    for line in open("senchaDatabaseData/memberInklings.txt", "r"):
        data = [x.strip() for x in line.split("|")]
        m = Member.objects.get(pk = data[0])
        i = Inkling.objects.get(pk = data[1])
        m.inklings.add(i)


def populate_dev_database():
    load_members()
    load_blots()
    load_inklings()
    load_member_inklings()
