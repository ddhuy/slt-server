# -*- coding: utf-8 -*-
# Generated by Django 1.11.14 on 2018-07-03 09:00
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('SltServer', '0002_auto_20180703_0129'),
    ]

    operations = [
        migrations.AlterField(
            model_name='testresult',
            name='Arch',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='SltServer.Architecture'),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='BenchNumber',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='BoardSerial',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='Description',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='ExecutionDate',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='LogFilePath',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='LotNumber',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='SltServer.LotNumber'),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='Operator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='SltServer.Profile'),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='Result',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='Rfid',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='SltMode',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='SltServer.SltMode'),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='SocketSerial',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='TestName',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
