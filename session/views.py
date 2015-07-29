# -*- coding: utf-8 -*-

from django.shortcuts import render
from dashboard.models import Session, SessionLogStep, AgentLogStep


def _requests(steps):
    it = iter(steps)
    requests = []
    for req in it:
        try:
            response_status = next(it).control_line.split(" ")[0]
        except StopIteration:
            response_status = None
        setattr(req, 'response_status', response_status)
        requests.append(req)
    return requests


def session(request, session_id):
    _session = Session.objects.get(id=session_id)
    session_log_steps = SessionLogStep.objects.filter(session_id=session_id).\
        order_by("time_created")
    context = {
        'session': _session,
        'session_log_steps': _requests(session_log_steps)
    }
    return render(request, 'session/session.html', context)


def log_step(request, session_id, step_id):
    session_log_step = SessionLogStep.objects.get(id=step_id)
    agent_log_steps = AgentLogStep.objects.filter(
        session_log_step_id=session_log_step.id).order_by('time_created')
    context = {
        'log_step': log_step,
        'agent_log_steps': _requests(agent_log_steps)
    }
    return render(request, 'session/session_log_step.html', context)


def _response(request, steps):
    response = None
    for num, step in enumerate(iter(steps)):
        if step == request:
            try:
                response = steps[num+1]
            except IndexError:
                response = None

    return response


def agent_step(request, session_id, agent_step_id):
    req = AgentLogStep.objects.get(id=agent_step_id)
    steps = AgentLogStep.objects.filter(
        session_log_step_id=req.session_log_step_id).order_by('time_created')

    context = {
        'request': req,
        'response': _response(req, steps)
    }
    return render(request, 'session/agent_log_step.html', context)


def session_step(request, session_id, session_step_id):
    req = SessionLogStep.objects.get(id=session_step_id)
    steps = SessionLogStep.objects.filter(session_id=req.session_id).\
        order_by('time_created')
    print steps
    context = {
        'request': req,
        'response': _response(req, steps)
    }
    return render(request, 'session/agent_log_step.html', context)