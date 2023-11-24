<?php

namespace Resound\Commands;

use Sharp\Classes\CLI\Args;
use Sharp\Classes\CLI\Command;
use Resound\Controllers\TagController;

class DiscoverNewFiles extends Command
{
    public function __invoke(Args $args)
    {
        TagController::extractLibraryTags();
        TagController::processQueue();

        return "OK";
    }
}