# -*- coding: utf-8 -*-
# Generated by Django 1.11.14 on 2018-07-12 07:17
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('SltServer', '0008_auto_20180710_1016'),
    ]

    operations = [
        migrations.AlterField(
            model_name='testresult',
            name='ExecutionDate',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='LotNumber',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='SltServer.LotNumber'),
        ),
    ]
