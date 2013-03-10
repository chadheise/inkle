from inkle.models import *

import shutil
import datetime

def load_members():
    """Loads the members into the database. """
    for line in open("databaseData/members.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        member = Member(
            first_name = data[0],
            last_name = data[1],
            username = data[2], email = data[2],
            birthday = datetime.date(day = int(data[3]), month = int(data[4]), year = int(data[5])),
            gender = data[6],
            is_staff = data[7]
        )
        member.set_password("password")
        member.save()

        if (data[6] == "Male"):
            shutil.copyfile("inkle/static/media/images/main/man.jpg", "inkle/static/media/images/members/" + str(member.id) + ".jpg")
        else:
            shutil.copyfile("inkle/static/media/images/main/woman.jpg", "inkle/static/media/images/members/" + str(member.id) + ".jpg")

        #user_profile = MemberProfile(user = user, birthday = datetime.date(day = int(data[3]), month = int(data[4]), year = int(data[5])), gender = data[6])
        #user_profile.save()


def load_friends():
    """Loads the member friendships into the database. """
    for line in open("databaseData/friends.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        if (data[1].strip()):
            sender = Member.objects.get(pk = data[0])
            receiver_ids = [x.strip() for x in data[1].split(",")]

            for receiver_id in receiver_ids:
                receiver = Member.objects.get(pk = receiver_id)

                assert (sender != receiver), "Sender and receiver IDs are both %d" % (sender.id)
                assert (receiver not in sender.friends.all()), "Sender (%d) and receiver (%d) are already friends" % (sender.id, receiver.id)

                sender.friends.add(receiver)


def load_friend_requests():
    """Loads the pending friend requests into the database. """
    for line in open("databaseData/friendRequests.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        if (data[1].strip()):
            sender = Member.objects.get(pk = data[0])
            receiver_ids = [x.strip() for x in data[1].split(",")]

            for receiver_id in receiver_ids:
                receiver = Member.objects.get(pk = receiver_id)

                assert (sender != receiver), "Sender and receiver IDs are both %d" % (sender.id)
                assert (receiver not in sender.friends.all()), "Sender (%d) and receiver (%d) are already friends" % (sender.id, receiver.id)
                assert (not sender.has_pending_friend_request_to(receiver)), "Sender (%d) already has a pending friend request to receiver (%d)" % (sender.id, receiver.id)
                assert (not receiver.has_pending_friend_request_to(sender)), "Receiver (%d) already has a pending friend request to sender (%d)" % (receiver.id, sender.id)

                FriendRequest.objects.create(sender = sender, receiver = receiver)


def load_groups():
    for line in open("databaseData/groups.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        creator = Member.objects.get(pk = data[1])
        group = Group.objects.create(creator = creator, name = data[0])

        for member_id in [x.strip() for x in data[2].split(",")]:
            member = Member.objects.get(pk = member_id)
            if (member in creator.friends.all()):
                group.members.add(member)


def load_inklings():
    for line in open("databaseData/inklings.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        creator = Member.objects.get(pk = data[5])
        inkling = Inkling.objects.create(creator = creator, date = datetime.date.today() + datetime.timedelta(days = int(data[1])), location = data[0], time = data[2], notes = data[3])

        # Create the sharing for the creator
        sp = SharingPermission.objects.create(creator = creator, inkling = inkling)
        for m in creator.friends.all():
            sp.members.add(m)

        # Create the sharing for each member attending the inkling
        for member_id in [x.strip() for x in data[4].split(",")]:
            member = Member.objects.get(pk = member_id)
            member.inklings.add(inkling)
            if (creator != member):
                sp = SharingPermission.objects.create(creator = member, inkling = inkling)
                for m in member.friends.all():
                    sp.members.add(m)


def load_inkling_invites():
    for line in open("databaseData/inklingInvitations.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        inkling = Inkling.objects.get(pk = data[0])
        sender = Member.objects.get(pk = data[1])
        receiver = Member.objects.get(pk = data[2])

        InklingInvitation.objects.create(inkling = inkling, sender = sender, receiver = receiver, status = data[3])


def load_feed_comments():
    for line in open("databaseData/feedComments.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        creator = Member.objects.get(pk = data[1])
        inkling = Inkling.objects.get(pk = data[0])

        FeedComment.objects.create(creator = creator, inkling = inkling, text = data[2])


def load_feed_updates():
    for line in open("databaseData/feedUpdates.txt", "r").readlines()[1:]:
        data = [x.strip() for x in line.split("|")]

        creator = Member.objects.get(pk = data[1])
        inkling = Inkling.objects.get(pk = data[0])

        if (inkling in creator.inklings.all()):
            FeedUpdate.objects.create(creator = creator, inkling = inkling, update_type = data[2], updated_to = data[3])


def populate_database():
    load_members()
    load_friends()
    load_friend_requests()
    load_groups()
    load_inklings()
    load_inkling_invites()
    load_feed_comments()
    load_feed_updates()
