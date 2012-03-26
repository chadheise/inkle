# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):
    
    def forwards(self, orm):
        
        # Adding field 'Member.response_email_preference'
        db.add_column('inkle_member', 'response_email_preference', self.gf('django.db.models.fields.BooleanField')(default=True, blank=True), keep_default=False)
    
    
    def backwards(self, orm):
        
        # Deleting field 'Member.response_email_preference'
        db.delete_column('inkle_member', 'response_email_preference')
    
    
    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'inkle.blot': {
            'Meta': {'object_name': 'Blot'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'members': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['inkle.Member']", 'symmetrical': 'False'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'inkle.inkling': {
            'Meta': {'object_name': 'Inkling'},
            'category': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'date': ('django.db.models.fields.DateField', [], {}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'location': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['inkle.Location']", 'null': 'True', 'blank': 'True'}),
            'member_place': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['inkle.Member']", 'null': 'True', 'blank': 'True'})
        },
        'inkle.invitation': {
            'Meta': {'object_name': 'Invitation'},
            'description': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'from_member': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['inkle.Member']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inkling': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['inkle.Inkling']"})
        },
        'inkle.location': {
            'Meta': {'object_name': 'Location'},
            'category': ('django.db.models.fields.CharField', [], {'default': "'Other'", 'max_length': '20'}),
            'city': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'phone': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10'}),
            'state': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2'}),
            'street': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'website': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '100'}),
            'zip_code': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '5'})
        },
        'inkle.member': {
            'Meta': {'object_name': 'Member', '_ormbases': ['auth.User']},
            'accepted': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'accepted_related'", 'symmetrical': 'False', 'to': "orm['inkle.Member']"}),
            'accepted_email_preference': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'birthday': ('django.db.models.fields.DateField', [], {}),
            'birthday_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'blots': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['inkle.Blot']", 'symmetrical': 'False'}),
            'changed_image': ('django.db.models.fields.IntegerField', [], {'default': '0', 'max_length': '3'}),
            'city': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'email_format_html': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'email_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'followers': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'followers_related'", 'symmetrical': 'False', 'to': "orm['inkle.Member']"}),
            'followers_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'following': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'following_related'", 'symmetrical': 'False', 'to': "orm['inkle.Member']"}),
            'following_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '6'}),
            'gender_privacy': ('django.db.models.fields.IntegerField', [], {'default': '0', 'max_length': '1'}),
            'general_email_preference': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'image_privacy': ('django.db.models.fields.IntegerField', [], {'default': '0', 'max_length': '1'}),
            'inklings': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['inkle.Inkling']", 'symmetrical': 'False'}),
            'inklings_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'invitations': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['inkle.Invitation']", 'symmetrical': 'False'}),
            'invitations_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'invited_email_preference': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'location_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'name_privacy': ('django.db.models.fields.IntegerField', [], {'default': '0', 'max_length': '1'}),
            'networks': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['inkle.Network']", 'symmetrical': 'False'}),
            'networks_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'pending': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'pending_related'", 'symmetrical': 'False', 'to': "orm['inkle.Member']"}),
            'phone': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10'}),
            'phone_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'place_privacy': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'requested': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'requested_related'", 'symmetrical': 'False', 'to': "orm['inkle.Member']"}),
            'requested_email_preference': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'response_email_preference': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2'}),
            'street': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '100'}),
            'user_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['auth.User']", 'unique': 'True', 'primary_key': 'True'}),
            'verification_hash': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'verified': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'zip_code': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '5'})
        },
        'inkle.network': {
            'Meta': {'object_name': 'Network'},
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }
    
    complete_apps = ['inkle']
