from inkle.models import *

import shutil
import datetime

def load_members():
    for line in open("senchaDatabaseData/members.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        member = Member(first_name = data[0], last_name = data[1], username = data[2], email = data[2], birthday = datetime.date(day = int(data[3]), month = int(data[4]), year = int(data[5])), gender = data[6], is_staff = data[7])
        member.set_password("password")
        member.save()
        
        if (data[6] == "Male"):
            shutil.copyfile("inkle/static/media/images/main/man.jpg", "inkle/static/media/images/members/" + str(member.id) + ".jpg")
        else:
            shutil.copyfile("inkle/static/media/images/main/woman.jpg", "inkle/static/media/images/members/" + str(member.id) + ".jpg")


def load_friendships():
    for line in open("senchaDatabaseData/friendships.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]
        
        m0 = Member.objects.get(pk = data[0])
        m1 = Member.objects.get(pk = data[1])

        if ((m0 != m1) and (m1 not in m0.friends.all())):
            m0.friends.add(m1)


def load_friend_requests():
    for line in open("senchaDatabaseData/friendRequests.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]
        
        m0 = Member.objects.get(pk = data[0])
        m1 = Member.objects.get(pk = data[1])
        
        if ((m0 != m1) and (m1 not in m0.friends.all()) and (not m0.has_pending_friend_request_to(m1)) and (not m1.has_pending_friend_request_to(m0))):
            FriendRequest.objects.create(sender = m0, receiver = m1)


def load_groups():
    for line in open("senchaDatabaseData/groups.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        creator = Member.objects.get(pk = data[1])
        group = Group.objects.create(creator = creator, name = data[0])

        for member_id in [x.strip() for x in data[2].split(",")]:
            member = Member.objects.get(pk = member_id)
            if (member in creator.friends.all()):
                group.members.add(member)


def load_inklings():
    for line in open("senchaDatabaseData/inklings.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        creator = Member.objects.get(pk = data[5])
        inkling = Inkling.objects.create(creator = creator, date = datetime.date.today() + datetime.timedelta(days = int(data[1])), location = data[0], time = data[2], notes = data[3])

        for member_id in [x.strip() for x in data[4].split(",")]:
            member = Member.objects.get(pk = member_id)
            member.inklings.add(inkling)


def load_feed_comments():
    for line in open("senchaDatabaseData/feedComments.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]
        
        inkling = Inkling.objects.get(pk = data[0])
        creator = Member.objects.get(pk = data[1])

        FeedComment.objects.create(creator = creator, inkling = inkling, text = data[2])


def load_feed_updates():
    for line in open("senchaDatabaseData/feedUpdates.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        inkling = Inkling.objects.get(pk = data[0])
        creator = Member.objects.get(pk = data[1])

        if (inkling in creator.inklings.all()):
            FeedUpdate.objects.create(creator = creator, inkling = inkling, update_type = data[2], updated_to = data[3])


def populate_database():
    load_members()
    load_friendships()
    load_friend_requests()
    load_groups()
    load_inklings()
    load_feed_comments()
    load_feed_updates()
