# -*- coding: utf-8 -*-
# Generated by Django 1.11.14 on 2018-07-10 17:16
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SltServer', '0007_auto_20180710_1011'),
    ]

    operations = [
        migrations.AlterField(
            model_name='testresult',
            name='ExecutionDate',
            field=models.DateTimeField(blank=True, default=datetime.datetime.now),
        ),
    ]
