#!/bin/php
<?php

use YonisSavary\Sharp\Classes\CLI\Console;
use YonisSavary\Sharp\Classes\Core\EventListener;
use YonisSavary\Sharp\Classes\Events\LoadedFramework;
use YonisSavary\Sharp\Classes\Events\LoadingFramework;

require_once "vendor/autoload.php";

EventListener::getInstance()->dispatch(new LoadingFramework());
EventListener::getInstance()->dispatch(new LoadedFramework());

Console::getInstance()->handleArgv($argv);

die;