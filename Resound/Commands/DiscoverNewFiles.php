<?php

namespace Resound\Commands;

use YonisSavary\Sharp\Classes\CLI\Args;
use Resound\Controllers\TagController;
use YonisSavary\Sharp\Classes\CLI\AbstractCommand;

class DiscoverNewFiles extends AbstractCommand
{
    public function execute(Args $args): int
    {
        TagController::extractLibraryTags();
        TagController::processQueue();

        return "OK";
    }
}