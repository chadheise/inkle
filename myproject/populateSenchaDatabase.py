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

def load_friendships():
    for line in open("senchaDatabaseData/friendships.txt", "r"):
        data = [x.strip() for x in line.split("|")]
        m0 = Member.objects.get(pk = data[0])
        m1 = Member.objects.get(pk = data[1])
        if ((m0 != m1) and (m1 not in m0.friends.all())):
            m0.friends.add(m1)

def load_blots():
    first = True
    for line in open("senchaDatabaseData/blots.txt", "r"):
        if first:
            first = False
            continue
        data = [x.strip() for x in line.split("|")]
        b = Blot(name = data[0])
        b.save()

        m = Member.objects.get(pk = data[1])
        m.blots.add(b)

        blot_members = [x.strip() for x in data[2].split(",")]
        for m_id in blot_members:
            m = Member.objects.get(pk = m_id)
            b.members.add(m)


def load_inklings():
    first = True
    for line in open("senchaDatabaseData/inklings.txt", "r"):
        data = [x.strip() for x in line.split("|")]
        if first:
            first = False
            continue
        l = Location(name = data[0])
        l.save()

        creator = Member.objects.get(pk = data[7])

        i = Inkling(creator = creator, date = datetime.date.today() + datetime.timedelta(days = int(data[1])), location = l, time = data[2], category = data[3], notes = data[4], is_private = data[5])
        i.save()

        inkling_members = [x.strip() for x in data[6].split(",")]
        for m_id in inkling_members:
            m = Member.objects.get(pk = m_id)
            m.inklings.add(i)


def load_comments():
    first = True
    for line in open("senchaDatabaseData/comments.txt", "r"):
        data = [x.strip() for x in line.split("|")]
        if first:
            first = False
            continue
        i = Inkling.objects.get(pk = data[0])
        m = Member.objects.get(pk = data[1])

        c = Comment(inkling = i, creator = m, text = data[2])
        c.save()


def load_events():
    first = True
    for line in open("senchaDatabaseData/events.txt", "r"):
        data = [x.strip() for x in line.split("|")]
        if first:
            first = False
            continue
        i = Inkling.objects.get(pk = data[0])
        m = Member.objects.get(pk = data[1])

        e = Event(inkling = i, member = m, category = data[2], text = data[3])
        e.save()


def populate_dev_database():
    load_members()
    load_friendships()
    load_blots()
    load_inklings()
    load_comments()
    load_events()
