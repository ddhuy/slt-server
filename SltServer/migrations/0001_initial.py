# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-06-29 04:26
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Architecture',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Name', models.CharField(max_length=255)),
                ('Description', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'Architecture',
                'verbose_name_plural': 'Architectures',
            },
        ),
        migrations.CreateModel(
            name='LotNumber',
            fields=[
                ('ID', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('Number', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'LotNumber',
                'verbose_name_plural': 'LotNumbers',
            },
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('DisplayName', models.CharField(max_length=255)),
                ('Rfid', models.IntegerField(blank=True, null=True, unique=True)),
                ('Role', models.CharField(choices=[(b'A', b'Admin'), (b'D', b'Developer'), (b'O', b'Operator')], default=b'O', max_length=255)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Profile',
                'verbose_name_plural': 'Profiles',
            },
        ),
        migrations.CreateModel(
            name='SltMode',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Mode', models.CharField(max_length=255, unique=True)),
                ('Text', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'SltMode',
                'verbose_name_plural': 'SltModes',
            },
        ),
        migrations.CreateModel(
            name='TestCommand',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Test', models.CharField(max_length=255)),
                ('FailStop', models.BooleanField(default=False)),
                ('Command', models.TextField()),
                ('Prompt', models.TextField()),
                ('Pass', models.TextField()),
                ('Fail', models.TextField()),
                ('Timeout', models.IntegerField()),
                ('Msg', models.TextField()),
                ('Comment', models.TextField()),
                ('Arch', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='SltServer.Architecture')),
            ],
            options={
                'verbose_name': 'TestCommand',
                'verbose_name_plural': 'TestCommands',
            },
        ),
        migrations.CreateModel(
            name='TestMode',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Mode', models.CharField(max_length=255, unique=True)),
                ('Text', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'TestMode',
                'verbose_name_plural': 'TestModes',
            },
        ),
        migrations.CreateModel(
            name='TestResult',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ECID1', models.CharField(blank=True, default=b'', max_length=255, null=True)),
                ('ECID2', models.CharField(blank=True, default=b'', max_length=255, null=True)),
                ('ECID3', models.CharField(blank=True, default=b'', max_length=255, null=True)),
                ('ECID4', models.CharField(blank=True, default=b'', max_length=255, null=True)),
                ('CPUID', models.CharField(blank=True, default=b'', max_length=255, null=True)),
                ('TestName', models.CharField(max_length=255)),
                ('BenchNumber', models.CharField(max_length=255)),
                ('BoardSerial', models.CharField(max_length=255)),
                ('SocketSerial', models.CharField(max_length=255)),
                ('DutMode', models.CharField(blank=True, choices=[(b'F', b'fullsgmii'), (b'N', b'nosgmii')], default=b'', max_length=255, null=True)),
                ('Result', models.CharField(max_length=255)),
                ('Rfid', models.IntegerField()),
                ('ExecutionDate', models.DateTimeField(auto_now_add=True)),
                ('LogFilePath', models.CharField(max_length=255)),
                ('TestEnvironments', models.TextField(blank=True, null=True)),
                ('Description', models.CharField(max_length=255)),
                ('Arch', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='SltServer.Architecture')),
                ('LotNumber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='SltServer.LotNumber')),
                ('Operator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='SltServer.Profile')),
                ('SltMode', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='SltServer.SltMode')),
            ],
            options={
                'verbose_name': 'TestResult',
                'verbose_name_plural': 'TestResults',
            },
        ),
        migrations.CreateModel(
            name='TestResultDetail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Test', models.CharField(max_length=255)),
                ('Result', models.CharField(blank=True, max_length=255, null=True)),
                ('Pass', models.IntegerField(default=0, null=True)),
                ('Fail', models.IntegerField(default=0, null=True)),
                ('ExecutingTime', models.IntegerField(default=0, null=True)),
                ('Mode', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='SltServer.TestMode')),
                ('TestResult', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='SltServer.TestResult')),
            ],
            options={
                'verbose_name': 'TestResultDetail',
                'verbose_name_plural': 'TestResultDetails',
            },
        ),
        migrations.AddField(
            model_name='testcommand',
            name='Mode',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='SltServer.TestMode'),
        ),
    ]
