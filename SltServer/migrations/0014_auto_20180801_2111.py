# -*- coding: utf-8 -*-
# Generated by Django 1.11.14 on 2018-08-02 04:11
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('SltServer', '0013_benchhistory'),
    ]

    operations = [
        migrations.AlterField(
            model_name='benchhistory',
            name='Bench',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Histories', to='SltServer.Bench'),
        ),
    ]
