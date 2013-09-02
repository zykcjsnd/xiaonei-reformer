#include "adh.h"

#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>

static const char *plugin_method_getVersion = "getVer";
static const char *plugin_method_getDirectory = "getDir";
static const char *plugin_method_download = "download";

NPError NP_Initialize(NPNetscapeFuncs* browserFuncs) {
	if (browserFuncs == NULL) {
		return NPERR_INVALID_FUNCTABLE_ERROR;
	}
	if (HIBYTE(browserFuncs->version) > NP_VERSION_MAJOR) {
		return NPERR_INCOMPATIBLE_VERSION_ERROR;
	}
	browser = browserFuncs;
	return NPERR_NO_ERROR;
}

NPError NP_GetEntryPoints(NPPluginFuncs* pluginFuncs) {
	if (pluginFuncs == NULL) {
		return NPERR_INVALID_FUNCTABLE_ERROR;
	}
#ifdef XP_MACOSX
	if (pluginFuncs->size == 0) {
		pluginFuncs->size = sizeof(pluginFuncs);
	}
#endif
	if (pluginFuncs->size < sizeof(pluginFuncs)) {
		return NPERR_INVALID_FUNCTABLE_ERROR;
	}
	pluginFuncs->version = (NP_VERSION_MAJOR << 8) | NP_VERSION_MINOR;
	pluginFuncs->newp = NPP_New;
	pluginFuncs->destroy = NPP_Destroy;
	pluginFuncs->setwindow = NPP_SetWindow;
	pluginFuncs->newstream = NPP_NewStream;
	pluginFuncs->destroystream = NPP_DestroyStream;
	pluginFuncs->asfile = NPP_StreamAsFile;
	pluginFuncs->writeready = NPP_WriteReady;
	pluginFuncs->write = (NPP_WriteProcPtr)NPP_Write;
	pluginFuncs->print = NPP_Print;
	pluginFuncs->event = NPP_HandleEvent;
	pluginFuncs->urlnotify = NPP_URLNotify;
	pluginFuncs->getvalue = NPP_GetValue;
	pluginFuncs->setvalue = NPP_SetValue;
	pluginFuncs->javaClass = NULL;
	
	return NPERR_NO_ERROR;
}


NPError NP_Shutdown(void) {
	return  NPERR_NO_ERROR;
}


bool plugin_has_method(NPObject *obj, NPIdentifier methodName) {
	NPUTF8 *name = browser->utf8fromidentifier(methodName);
	bool result = (strcmp(name, plugin_method_getVersion) == 0 ||
				   strcmp(name, plugin_method_getDirectory) == 0 ||
				   strcmp(name, plugin_method_download) == 0);
	browser->memfree(name);
	return result;
}

bool plugin_invoke(NPObject *obj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result) {

	NPUTF8 *name = browser->utf8fromidentifier(methodName);
	if (strcmp(name, plugin_method_getDirectory) == 0) {
		browser->memfree(name);
		NSOpenPanel *panel = [NSOpenPanel openPanel];
		[panel setCanChooseFiles:NO];
		[panel setCanChooseDirectories:YES];
		[panel setAllowsMultipleSelection:NO];
		// FIXME: do not block the main thread
		if ([panel runModal] == NSFileHandlingPanelCancelButton) {
			NULL_TO_NPVARIANT(*result);
			return true;
		}
		const char *path = [[[panel directoryURL] path] UTF8String];
		size_t len = strlen(path);
		char *p = browser->memalloc(len + 1);
		strcpy(p, path);
		STRINGN_TO_NPVARIANT2(p, len, *result);
		return true;
	} else if (strcmp(name, plugin_method_download) == 0) {
		browser->memfree(name);
		BOOLEAN_TO_NPVARIANT(false, *result);

		if (argCount < 4 || !NPVARIANT_IS_STRING(args[0]) || !NPVARIANT_IS_STRING(args[1]) || !NPVARIANT_IS_STRING(args[2]) || !NPVARIANT_IS_STRING(args[3])) {
			return true;
		}

		char *arg0 = normalizeNPString(&(NPVARIANT_TO_STRING(args[0])));
		char *arg1 = normalizeNPString(&(NPVARIANT_TO_STRING(args[1])));
		char *arg2 = normalizeNPString(&(NPVARIANT_TO_STRING(args[2])));
		char *arg3 = normalizeNPString(&(NPVARIANT_TO_STRING(args[3])));

		NSURL *url = [NSURL URLWithString:[NSString stringWithUTF8String:arg0]];
		NSData *urlData = [NSData dataWithContentsOfURL:url];
		NSString *basePath = [NSString stringWithUTF8String:arg1];
		NSString *dir = [NSString stringWithUTF8String:arg2];
		NSString *filename = [NSString stringWithUTF8String:arg3];
		NSString *path = [NSString stringWithFormat:@"%@/%@", basePath, dir];
		NSFileManager *fm = [NSFileManager defaultManager];
		if ([fm createDirectoryAtPath:path withIntermediateDirectories:YES attributes:nil error:nil] == YES) {
			path = [NSString stringWithFormat:@"%@/%@", path, filename];
			// FIXME: do not block the main thread
			BOOL res = [urlData writeToFile:path atomically:YES];
			BOOLEAN_TO_NPVARIANT(res, *result);
		}
		free(arg0);
		free(arg1);
		free(arg2);
		free(arg3);
		return true;
	} else if (strcmp(name, plugin_method_getVersion) == 0) {
		browser->memfree(name);
		INT32_TO_NPVARIANT(1, *result);
		return true;
	}
	browser->memfree(name);
	return false;
}

bool hasProperty(NPObject *obj, NPIdentifier propertyName) {
	return false;
}

bool getProperty(NPObject *obj, NPIdentifier propertyName, NPVariant *result) {
	return false;
}

// NPP Functions Implements
NPError NPP_New(NPMIMEType pluginType, NPP instance, uint16_t mode, int16_t argc, char* argn[], char* argv[], NPSavedData* saved) {
	
	if (instance == NULL) {
		return NPERR_INVALID_INSTANCE_ERROR;
	}

	// Check URL. This plugin instance should only be created by my extension
	NPObject *oWindow = NULL;
	NPError err;
	// Get window
	err = browser->getvalue(instance, NPNVWindowNPObject, &oWindow);
	if (err != NPERR_NO_ERROR) {
		return err;
	}
	// Get window.location
	NPIdentifier identifier = browser->getstringidentifier("location");
	NPVariant variantLocation;
	if (browser->getproperty(instance, oWindow, identifier, &variantLocation) == false) {
		return NPERR_GENERIC_ERROR;
	}
	NPObject *oLocation = variantLocation.value.objectValue;
	// Check window.location.protocol
	identifier = browser->getstringidentifier("protocol");
	NPVariant variantProtocal;
	if (browser->getproperty(instance, oLocation, identifier, &variantProtocal) == false) {
		browser->releasevariantvalue(&variantLocation);
		return NPERR_GENERIC_ERROR;
	}
	char *protocal = normalizeNPString(&(variantProtocal.value.stringValue));
	if (strcmp(protocal, "safari-extension:") != 0) {
		free(protocal);
		browser->releasevariantvalue(&variantProtocal);
		browser->releasevariantvalue(&variantLocation);
		return NPERR_INVALID_URL;
	}
	browser->releasevariantvalue(&variantProtocal);
	free(protocal);
	// Check window.location.host
	identifier = browser->getstringidentifier("host");
	NPVariant variantHost;
	if (browser->getproperty(instance, oLocation, identifier, &variantHost) == false) {
		browser->releasevariantvalue(&variantLocation);
		return NPERR_GENERIC_ERROR;
	}
	char *host = normalizeNPString(&(variantHost.value.stringValue));
	if (strcmp(host, "com.googlecode.xiaonei-reformer-H98TGNL6U3") != 0) {
		free(host);
		browser->releasevariantvalue(&variantHost);
		browser->releasevariantvalue(&variantLocation);
		return NPERR_INVALID_URL;
	}
	free(host);
	browser->releasevariantvalue(&variantHost);
	browser->releasevariantvalue(&variantLocation);

	// Create per-instance storage
	//obj = (PluginObject *)malloc(sizeof(PluginObject));
	//bzero(obj, sizeof(PluginObject));
	
	//obj->npp = instance;
	//instance->pdata = obj;

	if (!instance->pdata) {
		instance->pdata = browser->createobject(instance, &scriptablePluginClass);
	}
	// Ask the browser if it supports the CoreGraphics drawing model and Cocoa
	NPBool supportsFeature;
	if (browser->getvalue(instance, NPNVsupportsCoreGraphicsBool, &supportsFeature) != NPERR_NO_ERROR) {
		supportsFeature = FALSE;
	}
	if (!supportsFeature) {
		return NPERR_INCOMPATIBLE_VERSION_ERROR;
	} else {
		browser->setvalue(instance, NPPVpluginDrawingModel, (void *)NPDrawingModelCoreGraphics);
	}
	
	if (browser->getvalue(instance, NPNVsupportsCocoaBool, &supportsFeature) != NPERR_NO_ERROR) {
		supportsFeature = FALSE;
	}
	if (!supportsFeature) {
		return NPERR_INCOMPATIBLE_VERSION_ERROR;
	} else {
		browser->setvalue(instance, NPPVpluginEventModel, (void *)NPEventModelCocoa);
	}
	
	return NPERR_NO_ERROR;
}

NPError NPP_Destroy(NPP instance, NPSavedData** save) {
	// If we created a plugin instance, we'll destroy and clean it up.
	NPObject *pluginInstance=instance->pdata;
	if(!pluginInstance) {
		browser->releaseobject(pluginInstance);
		pluginInstance = NULL;
	}
	
	return NPERR_NO_ERROR;
}

NPError NPP_SetWindow(NPP instance, NPWindow* window) {
	return NPERR_NO_ERROR;
}


NPError NPP_NewStream(NPP instance, NPMIMEType type, NPStream* stream, NPBool seekable, uint16_t* stype) {
	*stype = NP_ASFILEONLY;
	return NPERR_NO_ERROR;
}

NPError NPP_DestroyStream(NPP instance, NPStream* stream, NPReason reason) {
	return NPERR_NO_ERROR;
}

int32_t NPP_WriteReady(NPP instance, NPStream* stream) {
	return 0;
}

int32_t NPP_Write(NPP instance, NPStream* stream, int32_t offset, int32_t len, void* buffer) {
	return 0;
}

void NPP_StreamAsFile(NPP instance, NPStream* stream, const char* fname) {
}

void NPP_Print(NPP instance, NPPrint* platformPrint) {
}


int16_t NPP_HandleEvent(NPP instance, void* event) {
	return 0;
}

void NPP_URLNotify(NPP instance, const char* url, NPReason reason, void* notifyData) {
}

NPError NPP_GetValue(NPP instance, NPPVariable variable, void *value) {
	NPObject *pluginInstance=NULL;
	switch(variable) {
		case NPPVpluginScriptableNPObject:
			// If we didn't create any plugin instance, we create it.
			pluginInstance=instance->pdata;
			if (pluginInstance) {
				browser->retainobject(pluginInstance);
			}
			*(NPObject **)value = pluginInstance;
			break;
		default:
			return NPERR_GENERIC_ERROR;
	}
	
	return NPERR_NO_ERROR;
}

NPError NPP_SetValue(NPP instance, NPNVariable variable, void *value) {
	return NPERR_GENERIC_ERROR;
}

char *normalizeNPString(const NPString *str) {
	char *p = malloc(str->UTF8Length + 1);
	strncpy(p, str->UTF8Characters, str->UTF8Length);
	p[str->UTF8Length] = 0;
	return p;
}
