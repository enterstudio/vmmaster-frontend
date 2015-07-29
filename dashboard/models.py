# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.db import models
from django.conf import settings


class VirtualMachine(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100, blank=True)
    ip = models.CharField(max_length=100, blank=True)
    mac = models.CharField(max_length=100, blank=True)

    class Meta:
        managed = False
        db_table = 'virtual_machines'


class Session(models.Model):
    id = models.IntegerField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=True,
        null=True,
        related_name="sessions",
        on_delete=models.SET_NULL,
    )
    vm = models.ForeignKey(
        VirtualMachine,
        blank=True,
        null=True,
        related_name="session",
        on_delete=models.SET_NULL,
    )
    name = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=100, blank=True)

    platform = models.CharField(max_length=100, blank=True)
    selenium_session = models.CharField(max_length=100, blank=True)
    desired_capabilities = models.CharField(max_length=200, blank=True)
    error = models.CharField(max_length=200, blank=True)

    time_created = models.FloatField(blank=True, null=True)
    time_modified = models.FloatField(blank=True, null=True)

    timeouted = models.BooleanField(blank=True, default=False)
    closed = models.BooleanField(blank=True, default=False)

    def __str__(self):
        return "[" + str(self.id) + "] " + self.name

    class Meta:
        managed = False
        db_table = 'sessions'


class SessionLogStep(models.Model):
    id = models.IntegerField(primary_key=True)
    session = models.ForeignKey(
        Session, blank=True, null=True, related_name="session_steps")
    control_line = models.CharField(max_length=100, blank=True)
    body = models.CharField(max_length=100, blank=True)
    screenshot = models.CharField(max_length=100, blank=True)
    time_created = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'session_log_steps'

    def __str__(self):
        return "[" + str(self.id) + "] " + self.control_line


class AgentLogStep(models.Model):
    id = models.IntegerField(primary_key=True)
    session_log_step = models.ForeignKey(
        SessionLogStep, blank=True, null=True, related_name="agent_steps")
    control_line = models.CharField(max_length=100, blank=True)
    body = models.CharField(max_length=100, blank=True)
    time_created = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'agent_log_steps'

    def __str__(self):
        return "[" + str(self.id) + "] " + self.control_line