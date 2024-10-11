<?php

namespace YonisSavary\Resound\Commands;

use YonisSavary\Sharp\Classes\CLI\Args;
use YonisSavary\Sharp\Classes\CLI\Command;
use YonisSavary\Resound\Controllers\TagController;

class DiscoverNewFiles extends Command
{
    public function __invoke(Args $args)
    {
        TagController::extractLibraryTags();
        TagController::processQueue();

        return "OK";
    }
}