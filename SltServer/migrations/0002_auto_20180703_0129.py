# -*- coding: utf-8 -*-
# Generated by Django 1.11.14 on 2018-07-03 08:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SltServer', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='testcommand',
            name='Command',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='testcommand',
            name='Comment',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='testcommand',
            name='Fail',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='testcommand',
            name='Msg',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='testcommand',
            name='Pass',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='testcommand',
            name='Prompt',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='testcommand',
            name='Timeout',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
