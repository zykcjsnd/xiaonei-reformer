#ifndef BasicPlugin_BasicPlugin_h
#define BasicPlugin_BasicPlugin_h

#import <WebKit/npapi.h>
#import <WebKit/npfunctions.h>
#import <WebKit/npruntime.h>

static NPNetscapeFuncs* browser;

// Mach-o entry points
NPError NP_Initialize(NPNetscapeFuncs *browserFuncs);
NPError NP_GetEntryPoints(NPPluginFuncs *pluginFuncs);
NPError NP_Shutdown(void);

// NPP Functions
NPError NPP_New(NPMIMEType pluginType, NPP instance, uint16_t mode, int16_t argc, char* argn[], char* argv[], NPSavedData* saved);
NPError NPP_Destroy(NPP instance, NPSavedData** save);
NPError NPP_SetWindow(NPP instance, NPWindow* window);
NPError NPP_NewStream(NPP instance, NPMIMEType type, NPStream* stream, NPBool seekable, uint16_t* stype);
NPError NPP_DestroyStream(NPP instance, NPStream* stream, NPReason reason);
int32_t NPP_WriteReady(NPP instance, NPStream* stream);
int32_t NPP_Write(NPP instance, NPStream* stream, int32_t offset, int32_t len, void* buffer);
void NPP_StreamAsFile(NPP instance, NPStream* stream, const char* fname);
void NPP_Print(NPP instance, NPPrint* platformPrint);
int16_t NPP_HandleEvent(NPP instance, void* event);
void NPP_URLNotify(NPP instance, const char* URL, NPReason reason, void* notifyData);
NPError NPP_GetValue(NPP instance, NPPVariable variable, void *value);
NPError NPP_SetValue(NPP instance, NPNVariable variable, void *value);
// End

// Functions for scriptablePluginClass
bool plugin_has_method(NPObject *obj, NPIdentifier methodName);
bool plugin_invoke(NPObject *obj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result);
bool hasProperty(NPObject *obj, NPIdentifier propertyName);
bool getProperty(NPObject *obj, NPIdentifier propertyName, NPVariant *result);
// End

static struct NPClass scriptablePluginClass = {
    NP_CLASS_STRUCT_VERSION,
    NULL,
    NULL,
    NULL,
    plugin_has_method,
    plugin_invoke,
    NULL,
    hasProperty,
    getProperty,
    NULL,
    NULL,
};

#ifndef HIBYTE
#define HIBYTE(x) ((((uint32_t)(x)) & 0xff00) >> 8)
#endif

// STRINGZ_TO_NPVARIANT and STRINGN_TO_NPVARIANT in npruntime.h are buggy
#define STRINGZ_TO_NPVARIANT2(_val, _v)                                   \
NP_BEGIN_MACRO                                                            \
(_v).type = NPVariantType_String;                                         \
NPString str = { _val, (uint32_t)(strlen(_val)) };                        \
(_v).value.stringValue = str;                                             \
NP_END_MACRO

#define STRINGN_TO_NPVARIANT2(_val, _len, _v)                             \
NP_BEGIN_MACRO                                                            \
(_v).type = NPVariantType_String;                                         \
NPString str = { _val, (uint32_t)(_len) };                                \
(_v).value.stringValue = str;                                             \
NP_END_MACRO

char *normalizeNPString(const NPString *str);

#endif
